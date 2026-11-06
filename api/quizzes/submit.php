<?php
/**
 * LMS Web - Soumission sécurisée d'un quiz/examen.
 * Contrôle l'accès, les dates, les tentatives, la correction automatique.
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'error' => 'Méthode POST requise.'], 405);
}
verifyCsrfToken();

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$quizId = (int)($input['quiz_id'] ?? 0);
$userAnswers = is_array($input['answers'] ?? null) ? $input['answers'] : [];
$pdo = getDB();

function normalizeAnswerValue($value): array {
    if (is_array($value)) {
        return array_values(array_map('strtolower', array_filter(array_map('strval', $value), static fn($entry) => trim((string)$entry) !== '')));
    }
    $normalized = strtolower(trim((string)$value));
    if ($normalized === '') return [];
    return [$normalized];
}

function isQuizOpen(array $quiz): bool {
    if (($quiz['status'] ?? 'published') !== 'published' || (int)($quiz['is_active'] ?? 0) !== 1) {
        return false;
    }
    $now = new DateTimeImmutable('now', new DateTimeZone('UTC'));
    if (!empty($quiz['opening_at'])) {
        $openingAt = new DateTimeImmutable($quiz['opening_at'], new DateTimeZone(date_default_timezone_get()));
        $openingAt = $openingAt->setTimezone(new DateTimeZone('UTC'));
        if ($now < $openingAt) {
            return false;
        }
    }
    if (!empty($quiz['closing_at'])) {
        $closingAt = new DateTimeImmutable($quiz['closing_at'], new DateTimeZone(date_default_timezone_get()));
        $closingAt = $closingAt->setTimezone(new DateTimeZone('UTC'));
        if ($now > $closingAt) {
            return false;
        }
    }
    return true;
}

if ($quizId <= 0) {
    sendJsonResponse(['success' => false, 'error' => 'Identifiant du quiz invalide.'], 400);
}

$qStmt = $pdo->prepare('SELECT q.* FROM quizzes q WHERE q.id = :id LIMIT 1');
$qStmt->execute(['id' => $quizId]);
$quiz = $qStmt->fetch();
if (!$quiz) {
    sendJsonResponse(['success' => false, 'error' => 'Quiz introuvable.'], 404);
}

if ($user['role'] === 'student' && ($quiz['status'] !== 'published' || (int)$quiz['is_active'] !== 1)) {
    sendJsonResponse(['success' => false, 'error' => 'Ce quiz n’est pas publié.'], 403);
}

if ($user['role'] === 'student') {
    $allowMultiple = !empty($quiz['allow_multiple_attempts']);
    $access = $pdo->prepare("SELECT 1 FROM enrollments WHERE user_id = :uid AND course_id = :cid AND status IN ('en_cours', 'termine') LIMIT 1");
    $access->execute(['uid' => $user['id'], 'cid' => $quiz['course_id']]);
    if (!$access->fetchColumn()) {
        sendJsonResponse(['success' => false, 'error' => 'Vous devez être inscrit au cours pour passer ce quiz.'], 403);
    }
    if (!isQuizOpen($quiz)) {
        sendJsonResponse(['success' => false, 'error' => 'Ce quiz n’est pas ouvert à la date actuelle.'], 403);
    }

    $existingAttempts = $pdo->prepare('SELECT id FROM quiz_attempts WHERE user_id = :uid AND quiz_id = :qid LIMIT 1');
    $existingAttempts->execute(['uid' => $user['id'], 'qid' => $quizId]);
    $existingAttempt = $existingAttempts->fetch();
    if ($existingAttempt && !$allowMultiple) {
        sendJsonResponse(['success' => false, 'error' => 'Une tentative a déjà été enregistrée pour ce quiz.'], 409);
    }
} elseif ($user['role'] === 'teacher') {
    $allowMultiple = false;
    $ownership = $pdo->prepare('SELECT 1 FROM courses WHERE id = :cid AND teacher_id = :uid LIMIT 1');
    $ownership->execute(['cid' => $quiz['course_id'], 'uid' => $user['id']]);
    if (!$ownership->fetchColumn()) {
        sendJsonResponse(['success' => false, 'error' => 'Ce quiz ne fait pas partie de vos cours.'], 403);
    }
} else {
    $allowMultiple = false;
    $adminAccess = $pdo->prepare('SELECT 1 FROM courses WHERE id = :cid LIMIT 1');
    $adminAccess->execute(['cid' => $quiz['course_id']]);
    if (!$adminAccess->fetchColumn()) {
        sendJsonResponse(['success' => false, 'error' => 'Accès refusé aux ressources de ce cours.'], 403);
    }
}

$questionsStmt = $pdo->prepare('SELECT * FROM quiz_questions WHERE quiz_id = :qid ORDER BY order_num ASC');
$questionsStmt->execute(['qid' => $quizId]);
$questions = $questionsStmt->fetchAll();
if (!$questions) {
    sendJsonResponse(['success' => false, 'error' => 'Ce quiz ne contient aucune question.'], 400);
}

$score = 0;
$totalQuestions = count($questions);
$maxScore = 0;
$corrections = [];
$manualReviewNeeded = false;

foreach ($questions as $question) {
    $qid = (int)$question['id'];
    $questionType = strtolower((string)($question['question_type'] ?? 'single'));
    $points = max(1, (int)($question['points'] ?? 1));
    $maxScore += $points;
    $rawAnswer = $userAnswers[$qid] ?? null;

    if (in_array($questionType, ['single', 'multiple', 'truefalse'], true)) {
        $normalizedUser = normalizeAnswerValue($rawAnswer);
        $expectedOptions = [];
        if ($questionType === 'single') {
            $expected = strtolower((string)($question['correct_option'] ?? ''));
            $expectedOptions = [$expected];
            $isCorrect = $expected !== '' && count($normalizedUser) === 1 && in_array($expected, $normalizedUser, true);
        } elseif ($questionType === 'multiple') {
            $expected = trim((string)($question['correct_options'] ?? ''));
            $expectedOptions = array_values(array_filter(array_map('strtolower', preg_split('/[\s,;]+/', $expected) ?: []), static fn($entry) => $entry !== ''));
            $isCorrect = count(array_diff($expectedOptions, $normalizedUser)) === 0 && count(array_intersect($expectedOptions, $normalizedUser)) === count($expectedOptions) && count($normalizedUser) === count($expectedOptions);
        } else {
            $expected = strtolower((string)($question['correct_option'] ?? ''));
            $expected = $expected === 'true' || $expected === 'a' ? 'a' : 'b';
            $normalizedUser = array_map('strtolower', $normalizedUser);
            $isCorrect = count($normalizedUser) === 1 && (in_array($expected, $normalizedUser, true) || in_array(($expected === 'a' ? 'true' : 'false'), $normalizedUser, true));
        }

        if ($isCorrect) {
            $score += $points;
        }

        $corrections[$qid] = [
            'type' => $questionType,
            'user_answer' => $rawAnswer,
            'correct_answer' => $question['correct_option'] ?? ($question['correct_options'] ?? ''),
            'is_correct' => $isCorrect,
            'points' => $points,
            'explanation' => $question['explanation'] ?? null,
        ];
    } elseif (in_array($questionType, ['short_text', 'short_answer', 'essay'], true)) {
        $expectedText = trim((string)($question['answer_text'] ?? ''));
        $userText = trim((string)($rawAnswer ?? ''));
        $isCorrect = $questionType !== 'essay' && $expectedText !== '' && $userText !== '' && strtolower($userText) === strtolower($expectedText);
        if ($isCorrect) {
            $score += $points;
        }
        $questionNeedsManualReview = $questionType === 'essay'
            || ($questionType === 'short_text' && $expectedText === '');
        $manualReviewNeeded = $manualReviewNeeded || $questionNeedsManualReview;
        $corrections[$qid] = [
            'type' => $questionType,
            'user_answer' => $userText,
            'correct_answer' => $expectedText,
            'is_correct' => $isCorrect,
            'points' => $points,
            'manual_review' => $questionNeedsManualReview,
            'explanation' => $question['explanation'] ?? null,
        ];
    } else {
        $manualReviewNeeded = true;
        $corrections[$qid] = [
            'type' => $questionType,
            'user_answer' => $rawAnswer,
            'is_correct' => false,
            'manual_review' => true,
            'points' => $points,
        ];
    }
}

$percentage = $maxScore > 0 ? round(($score / $maxScore) * 100, 2) : 0;
$passed = ($percentage >= (int)($quiz['pass_score_percent'] ?? 60)) ? 1 : 0;

$answerJson = json_encode($userAnswers, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
$attemptStatus = $manualReviewNeeded ? 'manual_review' : ($passed ? 'passed' : 'failed');
$pdo->beginTransaction();
try {
    if ($user['role'] === 'student' && !$allowMultiple) {
        $lockQuiz = $pdo->prepare('SELECT id FROM quizzes WHERE id = :qid FOR UPDATE');
        $lockQuiz->execute(['qid' => $quizId]);
        $lockAttempts = $pdo->prepare('SELECT id FROM quiz_attempts WHERE user_id = :uid AND quiz_id = :qid LIMIT 1 FOR UPDATE');
        $lockAttempts->execute(['uid' => $user['id'], 'qid' => $quizId]);
        if ($lockAttempts->fetch()) {
            $pdo->rollBack();
            sendJsonResponse(['success' => false, 'error' => 'Une tentative a déjà été enregistrée pour ce quiz.'], 409);
        }
    }

    $attemptStmt = $pdo->prepare('INSERT INTO quiz_attempts (user_id, quiz_id, score, total_questions, percentage, passed, answers_json, status, manual_review, result_published, attempted_at) VALUES (:uid, :qid, :score, :total, :pct, :passed, :answers, :status, :manual, :published, NOW())');
    $attemptStmt->execute([
        'uid' => (int)$user['id'],
        'qid' => $quizId,
        'score' => $score,
        'total' => $totalQuestions,
        'pct' => $percentage,
        'passed' => $passed,
        'answers' => $answerJson,
        'status' => $attemptStatus,
        'manual' => $manualReviewNeeded ? 1 : 0,
        'published' => 0,
    ]);
    $attemptId = (int)$pdo->lastInsertId();
    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendJsonResponse(['success' => false, 'error' => 'Enregistrement de la tentative impossible.'], 500);
}

sendJsonResponse([
    'success' => true,
    'attempt_id' => $attemptId,
    'manual_review' => $manualReviewNeeded,
    'result_published' => false,
    'score' => null,
    'max_score' => null,
    'total' => null,
    'percentage' => null,
    'passed' => null,
]);

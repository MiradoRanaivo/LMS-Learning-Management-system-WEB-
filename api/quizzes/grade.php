<?php
/**
 * Save manual grades and recalculate a quiz attempt.
 * POST /api/quizzes/grade.php
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth();
if ($user['role'] !== 'teacher') {
    sendJsonResponse(['success' => false, 'error' => 'La correction est réservée à l’enseignant du cours.'], 403);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'error' => 'Méthode POST requise.'], 405);
}
verifyCsrfToken();

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$attemptId = (int)($input['attempt_id'] ?? 0);
$grades = is_array($input['grades'] ?? null) ? $input['grades'] : [];
if ($attemptId <= 0 || $grades === []) {
    sendJsonResponse(['success' => false, 'error' => 'Tentative et notes de correction requises.'], 400);
}

$pdo = getDB();
$ownershipSql = ' AND c.teacher_id = :teacher_id';
$attemptStmt = $pdo->prepare("SELECT a.*, q.pass_score_percent, c.id AS course_id FROM quiz_attempts a JOIN quizzes q ON q.id = a.quiz_id JOIN courses c ON c.id = q.course_id WHERE a.id = :attempt_id" . $ownershipSql . ' LIMIT 1 FOR UPDATE');
$attemptParams = ['attempt_id' => $attemptId, 'teacher_id' => (int)$user['id']];

$pdo->beginTransaction();
try {
    $attemptStmt->execute($attemptParams);
    $attempt = $attemptStmt->fetch();
    if (!$attempt) {
        $pdo->rollBack();
        sendJsonResponse(['success' => false, 'error' => 'Tentative introuvable ou hors de vos cours.'], 404);
    }

    $answerData = json_decode((string)($attempt['answers_json'] ?? ''), true);
    $answers = is_array($answerData) ? $answerData : [];
    $questionStmt = $pdo->prepare('SELECT id, question_type, points, answer_text, correct_option, correct_options FROM quiz_questions WHERE quiz_id = :quiz_id ORDER BY order_num ASC');
    $questionStmt->execute(['quiz_id' => (int)$attempt['quiz_id']]);
    $questions = $questionStmt->fetchAll();
    $questionsById = [];
    foreach ($questions as $question) {
        $questionsById[(int)$question['id']] = $question;
    }

    $upsert = $pdo->prepare('INSERT INTO quiz_answer_grades (attempt_id, question_id, graded_by, points_awarded, teacher_comment) VALUES (:attempt_id, :question_id, :graded_by, :points_awarded, :teacher_comment) ON DUPLICATE KEY UPDATE graded_by = VALUES(graded_by), points_awarded = VALUES(points_awarded), teacher_comment = VALUES(teacher_comment), graded_at = CURRENT_TIMESTAMP');
    $seen = [];
    foreach ($grades as $grade) {
        if (!is_array($grade)) {
            throw new InvalidArgumentException('Format de correction invalide.');
        }
        $questionId = (int)($grade['question_id'] ?? 0);
        $points = filter_var($grade['points_awarded'] ?? null, FILTER_VALIDATE_INT);
        $comment = trim((string)($grade['teacher_comment'] ?? ''));
        if ($questionId <= 0 || isset($seen[$questionId]) || $points === false || strlen($comment) > 10000) {
            throw new InvalidArgumentException('Question, note ou commentaire invalide.');
        }
        $seen[$questionId] = true;
        $question = $questionsById[$questionId] ?? null;
        if (!$question) {
            throw new InvalidArgumentException('Question hors de cette tentative.');
        }
        $type = strtolower((string)$question['question_type']);
        $needsManualReview = $type === 'essay' || ($type === 'short_text' && trim((string)$question['answer_text']) === '');
        if (!$needsManualReview) {
            throw new InvalidArgumentException('Cette question ne nécessite pas de correction manuelle.');
        }
        if ($points < 0 || $points > (int)$question['points']) {
            throw new InvalidArgumentException('La note dépasse le barème de la question.');
        }
        $upsert->execute([
            'attempt_id' => $attemptId,
            'question_id' => $questionId,
            'graded_by' => (int)$user['id'],
            'points_awarded' => $points,
            'teacher_comment' => $comment === '' ? null : $comment,
        ]);
    }

    $savedStmt = $pdo->prepare('SELECT question_id, points_awarded FROM quiz_answer_grades WHERE attempt_id = :attempt_id');
    $savedStmt->execute(['attempt_id' => $attemptId]);
    $savedGrades = [];
    foreach ($savedStmt->fetchAll() as $saved) {
        $savedGrades[(int)$saved['question_id']] = (int)$saved['points_awarded'];
    }

    $score = 0;
    $maximumScore = 0;
    $manualQuestions = [];
    foreach ($questions as $question) {
        $questionId = (int)$question['id'];
        $type = strtolower((string)$question['question_type']);
        $points = max(1, (int)$question['points']);
        $maximumScore += $points;
        $answer = $answers[$questionId] ?? $answers[(string)$questionId] ?? null;
        $needsManualReview = $type === 'essay' || ($type === 'short_text' && trim((string)$question['answer_text']) === '');

        if ($needsManualReview) {
            $manualQuestions[] = $questionId;
            $score += $savedGrades[$questionId] ?? 0;
            continue;
        }

        if (in_array($type, ['single', 'truefalse'], true)) {
            $provided = is_array($answer) ? array_map(static fn($value) => strtolower(trim((string)$value)), $answer) : [strtolower(trim((string)$answer))];
            $expected = strtolower((string)($question['correct_option'] ?? ''));
            if ($type === 'truefalse') {
                $expected = ($expected === 'true' || $expected === 'a') ? 'a' : 'b';
                $provided = array_map(static fn($value) => $value === 'true' ? 'a' : ($value === 'false' ? 'b' : $value), $provided);
            }
            if ($expected !== '' && count($provided) === 1 && $provided[0] === $expected) {
                $score += $points;
            }
        } elseif ($type === 'multiple') {
            $expected = array_values(array_filter(array_map('strtolower', preg_split('/[\\s,;]+/', (string)$question['correct_options']) ?: []), static fn($value) => $value !== ''));
            $provided = is_array($answer) ? array_values(array_map(static fn($value) => strtolower(trim((string)$value)), $answer)) : [strtolower(trim((string)$answer))];
            sort($expected);
            sort($provided);
            if ($expected !== [] && $provided === $expected) {
                $score += $points;
            }
        } elseif ($type === 'short_text') {
            $expected = trim((string)$question['answer_text']);
            if ($expected !== '' && trim((string)$answer) !== '' && strtolower(trim((string)$answer)) === strtolower($expected)) {
                $score += $points;
            }
        }
    }

    $allManuallyGraded = count(array_diff($manualQuestions, array_keys($savedGrades))) === 0;
    $percentage = $maximumScore > 0 ? round(($score / $maximumScore) * 100, 2) : 0.0;
    $passed = $allManuallyGraded && $percentage >= (int)$attempt['pass_score_percent'] ? 1 : 0;
    $status = !$allManuallyGraded ? 'manual_review' : ($passed ? 'passed' : 'failed');
    $update = $pdo->prepare('UPDATE quiz_attempts SET score = :score, percentage = :percentage, passed = :passed, status = :status, manual_review = :manual_review, result_published = 0 WHERE id = :attempt_id');
    $update->execute([
        'score' => $score,
        'percentage' => $percentage,
        'passed' => $passed,
        'status' => $status,
        'manual_review' => $allManuallyGraded ? 0 : 1,
        'attempt_id' => $attemptId,
    ]);
    $pdo->commit();

    sendJsonResponse([
        'success' => true,
        'attempt_id' => $attemptId,
        'score' => $score,
        'max_score' => $maximumScore,
        'total' => count($questions),
        'percentage' => $percentage,
        'passed' => (bool)$passed,
        'manual_review' => !$allManuallyGraded,
        'status' => $status,
        'graded_questions' => count($savedGrades),
        'required_manual_questions' => count($manualQuestions),
    ]);
} catch (InvalidArgumentException $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendJsonResponse(['success' => false, 'error' => $error->getMessage()], 400);
} catch (Throwable $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Quiz manual grading failed: ' . $error->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Enregistrement de la correction impossible.'], 500);
}

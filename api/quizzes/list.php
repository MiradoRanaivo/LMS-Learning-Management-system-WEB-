<?php
/**
 * LMS Web - Gestion des quiz et examens.
 * Supporte la création, publication, accès et lecture des quiz.
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth();
$pdo = getDB();
$userId = (int)$user['id'];

function normalizeQuestionPayload(array $question, int $orderIndex): array {
    $type = strtolower((string)($question['question_type'] ?? $question['type'] ?? $question['kind'] ?? 'single'));
    $type = in_array($type, ['single', 'multiple', 'truefalse', 'short_answer', 'short_text', 'essay', 'development'], true)
        ? $type
        : 'single';

    if ($type === 'short_answer') $type = 'short_text';
    if ($type === 'development') $type = 'essay';

    $labelMap = [
        'option_a' => trim((string)($question['option_a'] ?? '')),
        'option_b' => trim((string)($question['option_b'] ?? '')),
        'option_c' => trim((string)($question['option_c'] ?? '')),
        'option_d' => trim((string)($question['option_d'] ?? '')),
    ];

    $selectedCorrect = array_filter(array_map('trim', (array)($question['correct_options'] ?? [])), static fn($value) => $value !== '');
    $correctOption = trim((string)($question['correct_option'] ?? ''));
    $correctText = trim((string)($question['answer_text'] ?? ''));

    if ($type === 'multiple' && $correctOption !== '') {
        $selectedCorrect = array_map('strtolower', preg_split('/[\s,;]+/', $correctOption) ?: []);
    }

    if ($type === 'truefalse') {
        $correctOption = strtolower($correctOption);
        if ($correctOption === 'true') $correctOption = 'a';
        if ($correctOption === 'false') $correctOption = 'b';
    }

    if ($type === 'single' && $correctOption === '' && isset($question['correct_index'])) {
        $correctOption = strtoupper((string)$question['correct_index']);
    }

    return [
        'type' => $type,
        'question_text' => trim((string)($question['question_text'] ?? '')),
        'option_a' => $labelMap['option_a'],
        'option_b' => $labelMap['option_b'],
        'option_c' => $labelMap['option_c'],
        'option_d' => $labelMap['option_d'],
        'correct_option' => strtolower($correctOption),
        'correct_options' => implode(',', array_map('strtolower', $selectedCorrect)),
        'answer_text' => $correctText,
        'explanation' => trim((string)($question['explanation'] ?? '')),
        'points' => max(1, (int)($question['points'] ?? $question['score_points'] ?? 1)),
        'order_num' => $orderIndex,
    ];
}

function quizStatusValue(array $quiz): string {
    if (isset($quiz['status']) && $quiz['status'] !== '') return strtolower((string)$quiz['status']);
    if (isset($quiz['is_active'])) return ((int)$quiz['is_active'] === 1) ? 'published' : 'archived';
    return 'published';
}

function quizIsCurrentlyAvailable(string $status, ?string $openingAt, ?string $closingAt): bool {
    return $status === 'published';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!in_array($user['role'], ['teacher', 'admin'], true)) {
        sendJsonResponse(['success' => false, 'error' => 'Action réservée aux enseignants et administrateurs.'], 403);
    }
    verifyCsrfToken();

    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $action = strtolower((string)($input['action'] ?? 'create'));
    $courseId = (int)($input['course_id'] ?? 0);
    $quizId = (int)($input['id'] ?? $input['quiz_id'] ?? 0);
    $title = trim((string)($input['title'] ?? ''));
    $assessmentType = strtolower((string)($input['assessment_type'] ?? 'quiz'));
    $description = trim((string)($input['description'] ?? ''));
    $instructions = trim((string)($input['instructions'] ?? ''));
    $duration = max(1, (int)($input['duration_minutes'] ?? 20));
    $passScore = max(0, min(100, (int)($input['pass_score_percent'] ?? $input['pass_score'] ?? 60)));
    $maxScore = max(1, (int)($input['max_score'] ?? 100));
    $status = strtolower((string)($input['status'] ?? $input['state'] ?? 'published'));
    $allowMultipleAttempts = filter_var($input['allow_multiple_attempts'] ?? false, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
    $openingAt = isset($input['opening_at']) && (string)$input['opening_at'] !== '' ? trim((string)$input['opening_at']) : null;
    $closingAt = isset($input['closing_at']) && (string)$input['closing_at'] !== '' ? trim((string)$input['closing_at']) : null;
    if ($status === 'active') $status = 'published';
    if (!in_array($assessmentType, ['quiz', 'exam'], true)) {
        sendJsonResponse(['success' => false, 'error' => 'Type d’évaluation invalide.'], 400);
    }

    foreach ([$openingAt, $closingAt] as $dateValue) {
        if ($dateValue !== null && strtotime($dateValue) === false) {
            sendJsonResponse(['success' => false, 'error' => 'Format de date d’ouverture ou de fermeture invalide.'], 400);
        }
    }

    if (in_array($action, ['delete', 'archive'], true)) {
        $quizId = $quizId ?: (int)($input['quiz_id'] ?? 0);
        if ($quizId <= 0) {
            sendJsonResponse(['success' => false, 'error' => 'Identifiant du quiz invalide.'], 400);
        }
        $check = $pdo->prepare('SELECT q.id, c.teacher_id FROM quizzes q JOIN courses c ON c.id = q.course_id WHERE q.id = :id LIMIT 1');
        $check->execute(['id' => $quizId]);
        $target = $check->fetch();
        if (!$target) {
            sendJsonResponse(['success' => false, 'error' => 'Quiz introuvable.'], 404);
        }
        if ($user['role'] === 'teacher' && (int)$target['teacher_id'] !== $userId) {
            sendJsonResponse(['success' => false, 'error' => 'Ce quiz ne fait pas partie de vos cours.'], 403);
        }

        if ($action === 'archive') {
            $archivage = $pdo->prepare('UPDATE quizzes SET is_active = 0, status = :status WHERE id = :id');
            $archivage->execute(['status' => 'archived', 'id' => $quizId]);
            sendJsonResponse(['success' => true, 'message' => 'Quiz archivé.']);
        }

        $delete = $pdo->prepare('DELETE FROM quizzes WHERE id = :id');
        $delete->execute(['id' => $quizId]);
        sendJsonResponse(['success' => true, 'message' => 'Quiz supprimé.']);
    }

    if (!in_array($action, ['create', 'update'], true)) {
        sendJsonResponse(['success' => false, 'error' => 'Action de gestion invalide.'], 400);
    }

    if ($action === 'update') {
        if ($quizId <= 0 || $courseId <= 0) {
            sendJsonResponse(['success' => false, 'error' => 'Cours et identifiant du quiz requis.'], 400);
        }
        if (!in_array($status, ['draft', 'published', 'archived'], true)) {
            sendJsonResponse(['success' => false, 'error' => 'Statut de quiz invalide.'], 400);
        }
        foreach ([$openingAt, $closingAt] as $dateValue) {
            if ($dateValue !== null && strtotime($dateValue) === false) {
                sendJsonResponse(['success' => false, 'error' => 'Format de date d’ouverture ou de fermeture invalide.'], 400);
            }
        }
        if ($openingAt !== null && $closingAt !== null && strtotime($closingAt) < strtotime($openingAt)) {
            sendJsonResponse(['success' => false, 'error' => 'La date de fermeture doit être postérieure à la date d’ouverture.'], 400);
        }
        $isActive = quizIsCurrentlyAvailable($status, $openingAt, $closingAt) ? 1 : 0;

        $ownership = $pdo->prepare('SELECT q.id, q.assessment_type, c.teacher_id FROM quizzes q JOIN courses c ON c.id = q.course_id WHERE q.id = :quiz_id LIMIT 1');
        $ownership->execute(['quiz_id' => $quizId]);
        $ownedQuiz = $ownership->fetch();
        if (!$ownedQuiz) {
            sendJsonResponse(['success' => false, 'error' => 'Quiz introuvable.'], 404);
        }
        if ($user['role'] === 'teacher' && (int)$ownedQuiz['teacher_id'] !== $userId) {
            sendJsonResponse(['success' => false, 'error' => 'Ce quiz ne fait pas partie de vos cours.'], 403);
        }
        if (!array_key_exists('assessment_type', $input)) {
            $assessmentType = (string)$ownedQuiz['assessment_type'];
        }

        $courseAccess = $pdo->prepare('SELECT id FROM courses WHERE id = :cid' . ($user['role'] === 'teacher' ? ' AND teacher_id = :uid' : '') . ' LIMIT 1');
        $params = ['cid' => $courseId];
        if ($user['role'] === 'teacher') $params['uid'] = $userId;
        $courseAccess->execute($params);
        if (!$courseAccess->fetchColumn()) {
            sendJsonResponse(['success' => false, 'error' => 'Le cours est introuvable ou non attribué.'], 403);
        }
        if ($title === '') {
            sendJsonResponse(['success' => false, 'error' => 'Le titre du quiz est requis.'], 400);
        }

        $questions = is_array($input['questions'] ?? null) ? $input['questions'] : [];
        if ($questions === []) {
            sendJsonResponse(['success' => false, 'error' => 'Ajoutez au moins une question pour modifier le quiz.'], 400);
        }
        foreach ($questions as $question) {
            $normalized = normalizeQuestionPayload($question, 1);
            if ($normalized['question_text'] === '') {
                sendJsonResponse(['success' => false, 'error' => 'Chaque question doit contenir un énoncé.'], 400);
            }
            if ($normalized['type'] === 'single' && !in_array($normalized['correct_option'], ['a', 'b', 'c', 'd'], true)) {
                sendJsonResponse(['success' => false, 'error' => 'Les QCM à réponse unique doivent fournir a, b, c ou d comme bonne réponse.'], 400);
            }
            if ($normalized['type'] === 'multiple' && $normalized['correct_options'] === '') {
                sendJsonResponse(['success' => false, 'error' => 'Les QCM à réponses multiples doivent définir des options correctes.'], 400);
            }
            if ($normalized['type'] === 'truefalse' && !in_array(strtolower(trim((string)($question['correct_option'] ?? ''))), ['true', 'false', 'a', 'b'], true)) {
                sendJsonResponse(['success' => false, 'error' => 'Les questions vrai/faux doivent définir true ou false comme réponse correcte.'], 400);
            }
        }

        $pdo->beginTransaction();
        try {
            $updateQuiz = $pdo->prepare('UPDATE quizzes SET course_id = :cid, title = :title, assessment_type = :assessment_type, description = :description, instructions = :instructions, duration_minutes = :duration, pass_score_percent = :pass, max_score = :max_score, is_active = :is_active, status = :status, allow_multiple_attempts = :attempts, opening_at = :opening_at, closing_at = :closing_at WHERE id = :quiz_id');
            $updateQuiz->execute([
                'cid' => $courseId,
                'title' => $title,
                'assessment_type' => $assessmentType,
                'description' => $description,
                'instructions' => $instructions,
                'duration' => $duration,
                'pass' => $passScore,
                'max_score' => $maxScore,
                'is_active' => $isActive,
                'status' => in_array($status, ['draft', 'published', 'archived']) ? $status : 'published',
                'attempts' => $allowMultipleAttempts,
                'opening_at' => $openingAt,
                'closing_at' => $closingAt,
                'quiz_id' => $quizId,
            ]);

            $pdo->prepare('DELETE FROM quiz_questions WHERE quiz_id = :quiz_id')->execute(['quiz_id' => $quizId]);
            $insertQuestion = $pdo->prepare('INSERT INTO quiz_questions (quiz_id, order_num, question_text, option_a, option_b, option_c, option_d, correct_option, correct_options, answer_text, explanation, question_type, points) VALUES (:quiz_id, :order_num, :question_text, :option_a, :option_b, :option_c, :option_d, :correct_option, :correct_options, :answer_text, :explanation, :question_type, :points)');
            foreach ($questions as $index => $question) {
                $normalized = normalizeQuestionPayload($question, $index + 1);
                if ($normalized['question_text'] === '') {
                    throw new InvalidArgumentException('Chaque question doit contenir un énoncé.');
                }
                if ($normalized['type'] === 'single' && !in_array($normalized['correct_option'], ['a', 'b', 'c', 'd'], true)) {
                    throw new InvalidArgumentException('Réponse correcte invalide.');
                }
                if ($normalized['type'] === 'multiple' && $normalized['correct_options'] === '') {
                    throw new InvalidArgumentException('Réponses correctes manquantes.');
                }
                if ($normalized['type'] === 'truefalse' && !in_array($normalized['correct_option'], ['a', 'b'], true)) {
                    throw new InvalidArgumentException('Réponse vrai/faux invalide.');
                }
                $insertQuestion->execute([
                    'quiz_id' => $quizId,
                    'order_num' => $normalized['order_num'],
                    'question_text' => $normalized['question_text'],
                    'option_a' => $normalized['option_a'],
                    'option_b' => $normalized['option_b'],
                    'option_c' => $normalized['option_c'],
                    'option_d' => $normalized['option_d'],
                    'correct_option' => $normalized['correct_option'],
                    'correct_options' => $normalized['correct_options'],
                    'answer_text' => $normalized['answer_text'],
                    'explanation' => $normalized['explanation'],
                    'question_type' => $normalized['type'],
                    'points' => $normalized['points'],
                ]);
            }

            $pdo->commit();
            sendJsonResponse(['success' => true, 'message' => 'Quiz mis à jour.', 'quiz_id' => $quizId], 200);
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            sendJsonResponse(['success' => false, 'error' => 'Modification du quiz impossible.'], 500);
        }
    }

    if ($courseId <= 0 || $title === '') {
        sendJsonResponse(['success' => false, 'error' => 'Cours et titre du quiz sont requis.'], 400);
    }
    if (!in_array($status, ['draft', 'published', 'archived'], true)) {
        sendJsonResponse(['success' => false, 'error' => 'Statut de quiz invalide.'], 400);
    }
    foreach ([$openingAt, $closingAt] as $dateValue) {
        if ($dateValue !== null && strtotime($dateValue) === false) {
            sendJsonResponse(['success' => false, 'error' => 'Format de date d’ouverture ou de fermeture invalide.'], 400);
        }
    }
    if ($openingAt !== null && $closingAt !== null && strtotime($closingAt) < strtotime($openingAt)) {
        sendJsonResponse(['success' => false, 'error' => 'La date de fermeture doit être postérieure à la date d’ouverture.'], 400);
    }
    $isActive = quizIsCurrentlyAvailable($status, $openingAt, $closingAt) ? 1 : 0;

    $courseAccess = $pdo->prepare('SELECT id FROM courses WHERE id = :cid' . ($user['role'] === 'teacher' ? ' AND teacher_id = :uid' : '') . ' LIMIT 1');
    $params = ['cid' => $courseId];
    if ($user['role'] === 'teacher') $params['uid'] = $userId;
    $courseAccess->execute($params);
    if (!$courseAccess->fetchColumn()) {
        sendJsonResponse(['success' => false, 'error' => 'Cours introuvable ou non attribué.'], 403);
    }

    $questions = is_array($input['questions'] ?? null) ? $input['questions'] : [];
    if ($questions === []) {
        sendJsonResponse(['success' => false, 'error' => 'Ajoutez au moins une question au quiz.'], 400);
    }

    foreach ($questions as $question) {
        $normalized = normalizeQuestionPayload($question, 1);
        if (trim((string)($normalized['question_text'])) === '') {
            sendJsonResponse(['success' => false, 'error' => 'Chaque question doit contenir un énoncé.'], 400);
        }
        if ($normalized['type'] === 'truefalse' && !in_array(strtolower(trim((string)($question['correct_option'] ?? ''))), ['true', 'false', 'a', 'b'], true)) {
            sendJsonResponse(['success' => false, 'error' => 'Les questions vrai/faux doivent définir true ou false comme réponse correcte.'], 400);
        }
        if (in_array($normalized['type'], ['single', 'multiple', 'truefalse'], true)) {
            if ($normalized['type'] === 'multiple' && $normalized['correct_options'] === '') {
                sendJsonResponse(['success' => false, 'error' => 'Les QCM à réponses multiples doivent définir des options correctes.'], 400);
            }
            if ($normalized['type'] === 'single' && !in_array($normalized['correct_option'], ['a', 'b', 'c', 'd'], true)) {
                sendJsonResponse(['success' => false, 'error' => 'Les QCM à réponse unique doivent fournir a, b, c ou d comme bonne réponse.'], 400);
            }
            if ($normalized['type'] === 'truefalse' && !in_array($normalized['correct_option'], ['a', 'b'], true)) {
                sendJsonResponse(['success' => false, 'error' => 'Les questions vrai/faux doivent définir true ou false comme réponse correcte.'], 400);
            }
        }
    }

    $pdo->beginTransaction();
    try {
        $insertQuiz = $pdo->prepare('INSERT INTO quizzes (course_id, title, assessment_type, description, instructions, duration_minutes, pass_score_percent, max_score, is_active, status, allow_multiple_attempts, opening_at, closing_at, created_at) VALUES (:cid, :title, :assessment_type, :description, :instructions, :duration, :pass, :max_score, :is_active, :status, :allow_multiple_attempts, :opening_at, :closing_at, NOW())');
        $insertQuiz->execute([
            'cid' => $courseId,
            'title' => $title,
            'assessment_type' => $assessmentType,
            'description' => $description,
            'instructions' => $instructions,
            'duration' => $duration,
            'pass' => $passScore,
            'max_score' => $maxScore,
            'is_active' => $isActive,
            'status' => in_array($status, ['draft', 'published', 'archived']) ? $status : 'published',
            'allow_multiple_attempts' => $allowMultipleAttempts,
            'opening_at' => $openingAt,
            'closing_at' => $closingAt,
        ]);
        $quizId = (int)$pdo->lastInsertId();

        $insertQuestion = $pdo->prepare('INSERT INTO quiz_questions (quiz_id, order_num, question_text, option_a, option_b, option_c, option_d, correct_option, correct_options, answer_text, explanation, question_type, points) VALUES (:quiz_id, :order_num, :question_text, :option_a, :option_b, :option_c, :option_d, :correct_option, :correct_options, :answer_text, :explanation, :question_type, :points)');
        foreach ($questions as $index => $question) {
            $normalized = normalizeQuestionPayload($question, $index + 1);
            $insertQuestion->execute([
                'quiz_id' => $quizId,
                'order_num' => $normalized['order_num'],
                'question_text' => $normalized['question_text'],
                'option_a' => $normalized['option_a'],
                'option_b' => $normalized['option_b'],
                'option_c' => $normalized['option_c'],
                'option_d' => $normalized['option_d'],
                'correct_option' => $normalized['correct_option'],
                'correct_options' => $normalized['correct_options'],
                'answer_text' => $normalized['answer_text'],
                'explanation' => $normalized['explanation'],
                'question_type' => $normalized['type'],
                'points' => $normalized['points'],
            ]);
        }

        $pdo->commit();
        sendJsonResponse(['success' => true, 'message' => 'Quiz créé.', 'quiz_id' => $quizId], 201);
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        sendJsonResponse(['success' => false, 'error' => 'Création du quiz impossible.'], 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(['success' => false, 'error' => 'Méthode GET ou POST requise.'], 405);
}

$sql = "SELECT q.*, c.title AS course_title, c.code AS course_code FROM quizzes q JOIN courses c ON c.id = q.course_id WHERE 1 = 1";
$params = [];

if ($user['role'] === 'student') {
    $sql .= " AND EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = q.course_id AND e.user_id = :uid AND e.status IN ('en_cours', 'termine'))";
    $sql .= " AND q.is_active = 1 AND q.status = 'published'";
    $sql .= ' AND (q.opening_at IS NULL OR q.opening_at <= NOW()) AND (q.closing_at IS NULL OR q.closing_at >= NOW())';
    $sql .= ' AND (q.opening_at IS NULL OR q.opening_at <= UTC_TIMESTAMP()) AND (q.closing_at IS NULL OR q.closing_at >= UTC_TIMESTAMP())';
    $params['uid'] = $userId;
} elseif ($user['role'] === 'teacher') {
    $sql .= ' AND c.teacher_id = :uid';
    $params['uid'] = $userId;
} elseif ($user['role'] !== 'admin') {
    sendJsonResponse(['success' => false, 'error' => 'Accès refusé.'], 403);
}

$statusFilter = strtolower((string)($_GET['status'] ?? 'all'));
if ($statusFilter === 'active') {
    $sql .= " AND (q.is_active = 1 OR q.status = 'published')";
} elseif ($statusFilter === 'draft') {
    $sql .= " AND (q.status = 'draft' OR q.is_active = 0)";
} elseif ($statusFilter === 'archived') {
    $sql .= " AND q.status = 'archived'";
}

$sql .= ' ORDER BY q.created_at DESC, q.id DESC';
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$quizzes = $stmt->fetchAll();

foreach ($quizzes as &$quiz) {
    $quiz['status'] = quizStatusValue($quiz);
    $questionCount = $pdo->prepare('SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = :qid');
    $questionCount->execute(['qid' => $quiz['id']]);
    $quiz['total_questions'] = (int)$questionCount->fetchColumn();
}
unset($quiz);

sendJsonResponse(['success' => true, 'quizzes' => $quizzes]);

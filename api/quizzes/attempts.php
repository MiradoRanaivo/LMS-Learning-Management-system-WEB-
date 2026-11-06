<?php
/**
 * Teacher-only attempt and result listing for a quiz or the teacher's courses.
 * GET /api/quizzes/attempts.php?quiz_id=123
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth();
if ($user['role'] !== 'teacher') {
    sendJsonResponse(['success' => false, 'error' => 'Accès réservé à l’enseignant du cours.'], 403);
}
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(['success' => false, 'error' => 'Méthode GET requise.'], 405);
}

$pdo = getDB();
$quizId = (int)($_GET['quiz_id'] ?? 0);
$teacherId = (int)$user['id'];
if ($quizId > 0) {
    $access = $pdo->prepare('SELECT c.teacher_id FROM quizzes q JOIN courses c ON c.id = q.course_id WHERE q.id = :quiz_id LIMIT 1');
    $access->execute(['quiz_id' => $quizId]);
    $ownerId = $access->fetchColumn();
    if ($ownerId === false) {
        sendJsonResponse(['success' => false, 'error' => 'Quiz introuvable.'], 404);
    }
    if ((int)$ownerId !== $teacherId) {
        sendJsonResponse(['success' => false, 'error' => 'Ce quiz ne fait pas partie de vos cours.'], 403);
    }
}
$ownershipSql = ' AND c.teacher_id = :teacher_id';
$sql = "SELECT a.id AS attempt_id, a.user_id, a.quiz_id, a.score, a.total_questions, a.percentage, a.passed, a.status, a.manual_review, a.result_published, a.answers_json, a.attempted_at, u.firstname, u.lastname, u.email, q.title AS quiz_title, q.assessment_type, q.pass_score_percent, c.id AS course_id, c.title AS course_title FROM quiz_attempts a JOIN users u ON u.id = a.user_id JOIN quizzes q ON q.id = a.quiz_id JOIN courses c ON c.id = q.course_id WHERE 1 = 1" . $ownershipSql;
$params = [];
$params['teacher_id'] = (int)$user['id'];
if ($quizId > 0) {
    $sql .= ' AND a.quiz_id = :quiz_id';
    $params['quiz_id'] = $quizId;
}
$sql .= ' ORDER BY a.attempted_at DESC, a.id DESC';
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$attempts = $stmt->fetchAll();

$questionStmt = $pdo->prepare('SELECT id, order_num, question_text, question_type, points, answer_text FROM quiz_questions WHERE quiz_id = :quiz_id ORDER BY order_num ASC');
$gradeStmt = $pdo->prepare('SELECT question_id, points_awarded, teacher_comment, graded_by, graded_at FROM quiz_answer_grades WHERE attempt_id = :attempt_id');
foreach ($attempts as &$attempt) {
    $answers = json_decode((string)($attempt['answers_json'] ?? ''), true);
    $attempt['answers'] = is_array($answers) ? $answers : [];
    unset($attempt['answers_json']);

    $questionStmt->execute(['quiz_id' => (int)$attempt['quiz_id']]);
    $questions = $questionStmt->fetchAll();
    $attempt['max_score'] = array_sum(array_map(static fn($question) => max(1, (int)$question['points']), $questions));
    $gradeStmt->execute(['attempt_id' => (int)$attempt['attempt_id']]);
    $grades = [];
    foreach ($gradeStmt->fetchAll() as $grade) {
        $grades[(int)$grade['question_id']] = [
            'points_awarded' => (int)$grade['points_awarded'],
            'teacher_comment' => $grade['teacher_comment'],
            'graded_by' => (int)$grade['graded_by'],
            'graded_at' => $grade['graded_at'],
        ];
    }

    foreach ($questions as &$question) {
        $questionId = (int)$question['id'];
        $type = strtolower((string)$question['question_type']);
        $manual = $type === 'essay' || ($type === 'short_text' && trim((string)$question['answer_text']) === '');
        $question['needs_manual_review'] = $manual;
        $question['student_answer'] = $attempt['answers'][$questionId] ?? $attempt['answers'][(string)$questionId] ?? null;
        $question['grade'] = $grades[$questionId] ?? null;
    }
    unset($question);
    $attempt['questions'] = $questions;
}
unset($attempt);

sendJsonResponse(['success' => true, 'attempts' => $attempts]);

<?php
/**
 * LMS Web - Récupération d'un Quiz
 * Sécurité : Les bonnes réponses NE SONT PAS envoyées au client
 * Méthode : GET
 * Paramètre : id
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth();
$quizId = (int)($_GET['id'] ?? 1);

$pdo = getDB();

$qStmt = $pdo->prepare("
    SELECT q.*, c.title AS course_title, c.code AS course_code
    FROM quizzes q
    JOIN courses c ON q.course_id = c.id
        WHERE q.id = :id AND q.is_active = 1 AND q.status = 'published'
            AND (q.opening_at IS NULL OR q.opening_at <= NOW())
            AND (q.closing_at IS NULL OR q.closing_at >= NOW())
    LIMIT 1
");
$qStmt->execute(['id' => $quizId]);
$quiz = $qStmt->fetch();

if (!$quiz) {
    sendJsonResponse(['success' => false, 'error' => 'Quiz introuvable.'], 404);
}

if (in_array($user['role'], ['student', 'teacher'], true) && ($quiz['status'] !== 'published' || (int)$quiz['is_active'] !== 1)) {
    sendJsonResponse(['success' => false, 'error' => 'Quiz introuvable.'], 404);
}

if ($user['role'] === 'student') {
    $access = $pdo->prepare("SELECT 1 FROM enrollments WHERE user_id = :uid AND course_id = :cid AND status = 'en_cours' LIMIT 1");
    $access->execute(['uid' => $user['id'], 'cid' => $quiz['course_id']]);
    if (!$access->fetchColumn()) {
        sendJsonResponse(['success' => false, 'error' => 'Ce quiz n’est pas accessible avec vos inscriptions.'], 403);
    }
} elseif ($user['role'] === 'teacher') {
    $ownership = $pdo->prepare('SELECT 1 FROM courses WHERE id = :cid AND teacher_id = :uid LIMIT 1');
    $ownership->execute(['cid' => $quiz['course_id'], 'uid' => $user['id']]);
    if (!$ownership->fetchColumn()) {
        sendJsonResponse(['success' => false, 'error' => 'Ce quiz ne fait pas partie de vos cours.'], 403);
    }
} elseif ($user['role'] !== 'admin') {
    sendJsonResponse(['success' => false, 'error' => 'Accès refusé.'], 403);
}

// Sélection des questions sans le champ 'correct_option' ni 'explanation'
$questStmt = $pdo->prepare("
    SELECT id, quiz_id, order_num, question_text, question_type, points, option_a, option_b, option_c, option_d
    FROM quiz_questions
    WHERE quiz_id = :qid
    ORDER BY order_num ASC
");
$questStmt->execute(['qid' => $quizId]);
$questions = $questStmt->fetchAll();

sendJsonResponse([
    'success' => true,
    'quiz' => $quiz,
    'total_questions' => count($questions),
    'questions' => $questions
]);

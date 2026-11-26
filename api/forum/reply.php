<?php
/**
 * LMS Web - Répondre à un sujet de forum
 * Méthode : POST
 * Paramètres : topic_id, content
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'error' => 'Méthode POST requise.'], 405);
}

verifyCsrfToken();
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$topicId = (int)($input['topic_id'] ?? 0);
$content = trim((string)($input['content'] ?? ''));

if ($topicId <= 0 || empty($content)) {
    sendJsonResponse(['success' => false, 'error' => 'Message requis.'], 400);
}

$pdo = getDB();

$topicAccess = $pdo->prepare("SELECT ft.author_id, ft.course_id, c.teacher_id FROM forum_topics ft JOIN courses c ON c.id = ft.course_id WHERE ft.id = :tid LIMIT 1");
$topicAccess->execute(['tid' => $topicId]);
$topic = $topicAccess->fetch();
if (!$topic) {
    sendJsonResponse(['success' => false, 'error' => 'Sujet introuvable.'], 404);
}

if ($user['role'] === 'student') {
    $enrollment = $pdo->prepare("SELECT 1 FROM enrollments WHERE user_id = :uid AND course_id = :cid AND status = 'en_cours' LIMIT 1");
    $enrollment->execute(['uid' => $user['id'], 'cid' => $topic['course_id']]);
    if (!$enrollment->fetchColumn()) {
        sendJsonResponse(['success' => false, 'error' => 'Vous devez être inscrit à ce cours pour répondre.'], 403);
    }
} elseif ($user['role'] === 'teacher' && (int)$topic['teacher_id'] !== (int)$user['id']) {
    sendJsonResponse(['success' => false, 'error' => 'Vous ne pouvez répondre que dans vos cours.'], 403);
}

$stmt = $pdo->prepare("
    INSERT INTO forum_replies (topic_id, author_id, content, likes_count, is_solution, created_at)
    VALUES (:tid, :uid, :content, 0, 0, CURRENT_TIMESTAMP)
");
$stmt->execute([
    'tid' => $topicId,
    'uid' => $user['id'],
    'content' => $content
]);

sendJsonResponse([
    'success' => true,
    'message' => 'Votre réponse a été publiée avec succès !'
]);

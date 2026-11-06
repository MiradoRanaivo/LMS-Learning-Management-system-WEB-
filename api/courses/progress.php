<?php
/**
 * LMS Web - Enregistrement de la progression d'une leçon
 * Méthode : POST
 * Paramètres : lesson_id, is_completed (0 ou 1)
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'error' => 'Méthode POST requise.'], 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$lessonId = (int)($input['lesson_id'] ?? 0);
$isCompleted = !empty($input['is_completed']) ? 1 : 0;
$userId = (int)$user['id'];

if ($lessonId <= 0) {
    sendJsonResponse(['success' => false, 'error' => 'Identifiant de leçon invalide.'], 400);
}

$pdo = getDB();

$access = $pdo->prepare("SELECT c.id, c.is_published AS course_published, l.is_published FROM lessons l JOIN chapters ch ON ch.id = l.chapter_id JOIN courses c ON c.id = ch.course_id JOIN enrollments e ON e.course_id = c.id WHERE l.id = :lesson_id AND e.user_id = :user_id AND e.status IN ('en_cours', 'termine') LIMIT 1");
$access->execute(['lesson_id' => $lessonId, 'user_id' => $userId]);
$lessonAccess = $access->fetch();
if (!$lessonAccess || (int)$lessonAccess['is_published'] !== 1 || (int)$lessonAccess['course_published'] !== 1) {
    sendJsonResponse(['success' => false, 'error' => 'Leçon inaccessible.'], 403);
}

if ($pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite') {
    $stmt = $pdo->prepare("INSERT INTO lesson_progress (user_id, lesson_id, is_completed, completed_at) VALUES (:uid, :lid, :comp, CURRENT_TIMESTAMP) ON CONFLICT(user_id, lesson_id) DO UPDATE SET is_completed = excluded.is_completed, completed_at = CURRENT_TIMESTAMP");
    $stmt->execute(['uid' => $userId, 'lid' => $lessonId, 'comp' => $isCompleted]);
} else {
    $stmt = $pdo->prepare("INSERT INTO lesson_progress (user_id, lesson_id, is_completed, completed_at) VALUES (:uid, :lid, :comp, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE is_completed = VALUES(is_completed), completed_at = CURRENT_TIMESTAMP");
    $stmt->execute(['uid' => $userId, 'lid' => $lessonId, 'comp' => $isCompleted]);
}

sendJsonResponse([
    'success' => true,
    'message' => 'Progression mise à jour avec succès.',
    'lesson_id' => $lessonId,
    'is_completed' => (bool)$isCompleted
]);

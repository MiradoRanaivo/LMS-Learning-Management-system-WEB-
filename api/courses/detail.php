<?php
/**
 * LMS Web - Détail d'un cours (Chapitres, Leçons, Ressources, Forum)
 * Méthode : GET
 * Paramètre : id
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth();
$courseId = (int)($_GET['id'] ?? 1);

$pdo = getDB();

// Cours info
$stmt = $pdo->prepare("
    SELECT c.*, cat.name AS category_name, u.firstname AS teacher_firstname, u.lastname AS teacher_lastname
    FROM courses c
    LEFT JOIN categories cat ON cat.id = c.category_id
    JOIN users u ON c.teacher_id = u.id
    WHERE c.id = :id LIMIT 1
");
$stmt->execute(['id' => $courseId]);
$course = $stmt->fetch();

if (!$course) {
    sendJsonResponse(['success' => false, 'error' => 'Cours introuvable.'], 404);
}

$userId = (int)$user['id'];
if ($user['role'] === 'student') {
    $access = $pdo->prepare("SELECT 1 FROM enrollments WHERE user_id = :uid AND course_id = :cid AND status IN ('en_cours', 'termine') LIMIT 1");
    $access->execute(['uid' => $userId, 'cid' => $courseId]);
    if (!$access->fetchColumn() || (int)$course['is_published'] !== 1) {
        sendJsonResponse(['success' => false, 'error' => 'Ce cours ne fait pas partie de vos inscriptions.'], 403);
    }
} elseif ($user['role'] === 'teacher' && (int)$course['teacher_id'] !== $userId) {
    sendJsonResponse(['success' => false, 'error' => 'Ce cours ne vous est pas attribué.'], 403);
}

// Chapitres
$chapStmt = $pdo->prepare("
    SELECT * FROM chapters WHERE course_id = :cid ORDER BY order_num ASC
");
$chapStmt->execute(['cid' => $courseId]);
$chapters = $chapStmt->fetchAll();

// Leçons avec statut complété
foreach ($chapters as &$chapter) {
    $lessStmt = $pdo->prepare("
        SELECT l.*, COALESCE(lp.is_completed, 0) AS is_completed
        FROM lessons l
        LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = :uid
                WHERE l.chapter_id = :chid
                    AND (:is_student = 0 OR l.is_published = 1)
        ORDER BY l.order_num ASC
    ");
        $lessStmt->execute(['chid' => $chapter['id'], 'uid' => $userId, 'is_student' => $user['role'] === 'student' ? 1 : 0]);
    $chapter['lessons'] = $lessStmt->fetchAll();
}

// Ressources du cours
$resStmt = $pdo->prepare("SELECT id, course_id, title, description, type, file_format, file_size, file_url, storage_key, external_url, published_date FROM resources WHERE course_id = :cid ORDER BY id DESC");
$resStmt->execute(['cid' => $courseId]);
$resources = $resStmt->fetchAll();
foreach ($resources as &$resource) {
    if (!empty($resource['external_url'])) {
        $resource['access_url'] = $resource['external_url'];
    } elseif (preg_match('/^https?:\/\//i', (string)$resource['file_url'])) {
        $resource['access_url'] = $resource['file_url'];
    } elseif (!empty($resource['storage_key'])) {
        $resource['access_url'] = '../api/resources/download.php?id=' . (int)$resource['id'];
    } else {
        $resource['access_url'] = null;
    }
    unset($resource['file_url'], $resource['storage_key'], $resource['external_url']);
}
unset($resource);

// Sujets forum du cours
$forStmt = $pdo->prepare("
    SELECT ft.*, u.firstname, u.lastname, u.avatar_initials,
           (SELECT COUNT(*) FROM forum_replies WHERE topic_id = ft.id) AS replies_count
    FROM forum_topics ft
    JOIN users u ON ft.author_id = u.id
    WHERE ft.course_id = :cid
    ORDER BY ft.created_at DESC
");
$forStmt->execute(['cid' => $courseId]);
$topics = $forStmt->fetchAll();

sendJsonResponse([
    'success' => true,
    'course' => $course,
    'chapters' => $chapters,
    'resources' => $resources,
    'topics' => $topics
]);

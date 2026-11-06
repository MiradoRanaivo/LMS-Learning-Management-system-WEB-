<?php
/** Gestion des sections (chapitres) d'un cours. */
declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth();
$pdo = getDB();
$role = (string)$user['role'];
$userId = (int)$user['id'];

$courseAccess = static function (int $courseId) use ($pdo, $user, $role, $userId): void {
    $stmt = $pdo->prepare('SELECT id, teacher_id, is_published FROM courses WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $courseId]);
    $course = $stmt->fetch();
    if (!$course) {
        sendJsonResponse(['success' => false, 'error' => 'Cours introuvable.'], 404);
    }
    if ($role === 'teacher' && (int)$course['teacher_id'] !== $userId) {
        sendJsonResponse(['success' => false, 'error' => 'Ce cours ne vous est pas attribué.'], 403);
    }
    if ($role === 'student') {
        $enrollment = $pdo->prepare("SELECT 1 FROM enrollments WHERE user_id = :uid AND course_id = :cid AND status IN ('en_cours', 'termine') LIMIT 1");
        $enrollment->execute(['uid' => $userId, 'cid' => $courseId]);
        if (!$enrollment->fetchColumn() || (int)$course['is_published'] !== 1) {
            sendJsonResponse(['success' => false, 'error' => 'Ce cours ne fait pas partie de vos inscriptions.'], 403);
        }
    }
};

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $courseId = (int)($_GET['course_id'] ?? 0);
    if ($courseId <= 0) {
        sendJsonResponse(['success' => false, 'error' => 'Identifiant de cours invalide.'], 400);
    }
    $courseAccess($courseId);
    $stmt = $pdo->prepare('SELECT id, course_id, order_num, title, description FROM chapters WHERE course_id = :course_id ORDER BY order_num, id');
    $stmt->execute(['course_id' => $courseId]);
    sendJsonResponse(['success' => true, 'chapters' => $stmt->fetchAll(), 'csrf_token' => getCsrfToken()]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: GET, POST');
    sendJsonResponse(['success' => false, 'error' => 'Méthode non autorisée.'], 405);
}
verifyCsrfToken();
if (!in_array($role, ['teacher', 'admin'], true)) {
    sendJsonResponse(['success' => false, 'error' => 'Action réservée aux enseignants.'], 403);
}
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) $input = $_POST;
$action = (string)($input['action'] ?? 'create');
$courseId = (int)($input['course_id'] ?? 0);
if ($courseId <= 0) sendJsonResponse(['success' => false, 'error' => 'Identifiant de cours invalide.'], 400);
$courseAccess($courseId);

if ($action === 'create' || $action === 'update') {
    $id = (int)($input['id'] ?? 0);
    $title = trim((string)($input['title'] ?? ''));
    $description = trim((string)($input['description'] ?? ''));
    $order = max(1, (int)($input['order_num'] ?? 1));
    if ($title === '' || mb_strlen($title) > 200 || mb_strlen($description) > 65535) {
        sendJsonResponse(['success' => false, 'error' => 'Titre obligatoire (200 caractères maximum) et description invalide.'], 400);
    }
    if ($action === 'create') {
        $stmt = $pdo->prepare('INSERT INTO chapters (course_id, order_num, title, description) VALUES (:course_id, :order_num, :title, :description)');
        $stmt->execute(['course_id' => $courseId, 'order_num' => $order, 'title' => $title, 'description' => $description !== '' ? $description : null]);
        sendJsonResponse(['success' => true, 'chapter_id' => (int)$pdo->lastInsertId()], 201);
    }
    $stmt = $pdo->prepare('UPDATE chapters SET title = :title, description = :description, order_num = :order_num WHERE id = :id AND course_id = :course_id');
    $stmt->execute(['title' => $title, 'description' => $description !== '' ? $description : null, 'order_num' => $order, 'id' => $id, 'course_id' => $courseId]);
    if ($stmt->rowCount() === 0) {
        $exists = $pdo->prepare('SELECT 1 FROM chapters WHERE id = :id AND course_id = :course_id');
        $exists->execute(['id' => $id, 'course_id' => $courseId]);
        if (!$exists->fetchColumn()) sendJsonResponse(['success' => false, 'error' => 'Section introuvable.'], 404);
    }
    sendJsonResponse(['success' => true, 'message' => 'Section mise à jour.']);
}

if ($action === 'delete') {
    $id = (int)($input['id'] ?? 0);
    $check = $pdo->prepare('SELECT COUNT(*) FROM lessons WHERE chapter_id = :id');
    $check->execute(['id' => $id]);
    if ((int)$check->fetchColumn() > 0) sendJsonResponse(['success' => false, 'error' => 'Cette section contient des leçons et ne peut pas être supprimée.'], 409);
    $stmt = $pdo->prepare('DELETE FROM chapters WHERE id = :id AND course_id = :course_id');
    $stmt->execute(['id' => $id, 'course_id' => $courseId]);
    if ($stmt->rowCount() === 0) sendJsonResponse(['success' => false, 'error' => 'Section introuvable.'], 404);
    sendJsonResponse(['success' => true]);
}

if ($action === 'reorder') {
    $ids = $input['chapter_ids'] ?? null;
    if (!is_array($ids) || count($ids) > 500) sendJsonResponse(['success' => false, 'error' => 'Ordre des sections invalide.'], 400);
    $pdo->beginTransaction();
    try {
        $check = $pdo->prepare('SELECT COUNT(*) FROM chapters WHERE course_id = :course_id AND id = :id');
        $update = $pdo->prepare('UPDATE chapters SET order_num = :order_num WHERE course_id = :course_id AND id = :id');
        foreach (array_values($ids) as $index => $id) {
            $id = (int)$id;
            $check->execute(['course_id' => $courseId, 'id' => $id]);
            if (!$check->fetchColumn()) throw new RuntimeException('Section invalide dans le nouvel ordre.');
            $update->execute(['order_num' => $index + 1, 'course_id' => $courseId, 'id' => $id]);
        }
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        sendJsonResponse(['success' => false, 'error' => $error->getMessage()], 400);
    }
    sendJsonResponse(['success' => true]);
}

sendJsonResponse(['success' => false, 'error' => 'Action inconnue.'], 400);
<?php
/** Bibliothèque de ressources : lecture, création, modification et suppression. */
declare(strict_types=1);
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../resource_helpers.php';

$user = checkAuth();
$pdo = getDB();
$role = (string)$user['role'];
$userId = (int)$user['id'];
$canManage = in_array($role, ['teacher', 'admin'], true);

$assertCourseAccess = static function (?int $courseId) use ($pdo, $role, $userId): void {
    if ($courseId === null) return;
    $stmt = $pdo->prepare('SELECT id, teacher_id, is_published FROM courses WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $courseId]);
    $course = $stmt->fetch();
    if (!$course) sendJsonResponse(['success' => false, 'error' => 'Cours introuvable.'], 404);
    if ($role === 'teacher' && (int)$course['teacher_id'] !== $userId) sendJsonResponse(['success' => false, 'error' => 'Vous ne pouvez gérer que les ressources de vos cours.'], 403);
    if ($role === 'student') {
        $enrollment = $pdo->prepare("SELECT 1 FROM enrollments WHERE user_id = :uid AND course_id = :cid AND status IN ('en_cours', 'termine') LIMIT 1");
        $enrollment->execute(['uid' => $userId, 'cid' => $courseId]);
        if (!$enrollment->fetchColumn() || (int)$course['is_published'] !== 1) sendJsonResponse(['success' => false, 'error' => 'Ressource inaccessible.'], 403);
    }
};

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $type = (string)($_GET['type'] ?? 'all');
    $courseId = isset($_GET['course_id']) && $_GET['course_id'] !== '' ? (int)$_GET['course_id'] : null;
    $sql = "SELECT r.id, r.course_id, r.title, r.description, r.type, r.file_format, r.file_size, r.file_url, r.storage_key, r.mime_type, r.file_size_bytes, r.external_url, r.published_date, c.title AS course_title, c.code AS course_code, u.firstname AS uploader_firstname, u.lastname AS uploader_lastname FROM resources r LEFT JOIN courses c ON r.course_id = c.id JOIN users u ON r.uploader_id = u.id WHERE 1=1";
    $params = [];
    if ($role === 'student') {
        $sql .= " AND (r.course_id IS NULL OR (c.is_published = 1 AND EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = r.course_id AND e.user_id = :student_id AND e.status IN ('en_cours', 'termine'))))";
        $params['student_id'] = $userId;
    } elseif ($role === 'teacher') {
        $sql .= ' AND (r.course_id IS NULL OR c.teacher_id = :teacher_id)';
        $params['teacher_id'] = $userId;
    }
    if ($type !== 'all') {
        if (!in_array($type, ['document', 'cours', 'video', 'lien', 'image'], true)) sendJsonResponse(['success' => false, 'error' => 'Filtre de type invalide.'], 400);
        $sql .= ' AND r.type = :type';
        $params['type'] = $type;
    }
    if ($courseId !== null) {
        $assertCourseAccess($courseId);
        $sql .= ' AND r.course_id = :course_id';
        $params['course_id'] = $courseId;
    }
    $sql .= ' ORDER BY r.published_date DESC, r.id DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $resources = $stmt->fetchAll();
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
        unset($resource['file_url'], $resource['storage_key'], $resource['mime_type'], $resource['file_size_bytes']);
    }
    unset($resource);
    sendJsonResponse(['success' => true, 'resources' => $resources, 'csrf_token' => getCsrfToken()]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: GET, POST');
    sendJsonResponse(['success' => false, 'error' => 'Méthode non autorisée.'], 405);
}
verifyCsrfToken();
if (!$canManage) sendJsonResponse(['success' => false, 'error' => 'Action réservée aux enseignants et administrateurs.'], 403);
$input = $_POST;
$action = (string)($input['action'] ?? 'create');
$id = (int)($input['id'] ?? 0);
$title = trim((string)($input['title'] ?? ''));
$description = trim((string)($input['description'] ?? ''));
$type = (string)($input['type'] ?? 'document');
$courseId = isset($input['course_id']) && $input['course_id'] !== '' ? (int)$input['course_id'] : null;

if ($action === 'delete') {
    $stmt = $pdo->prepare('SELECT r.storage_key, r.mime_type, r.course_id, r.uploader_id FROM resources r WHERE r.id = :id');
    $stmt->execute(['id' => $id]);
    $resource = $stmt->fetch();
    if (!$resource) sendJsonResponse(['success' => false, 'error' => 'Ressource introuvable.'], 404);
    $assertCourseAccess($resource['course_id'] !== null ? (int)$resource['course_id'] : null);
    if ($role === 'teacher' && $resource['course_id'] === null && (int)$resource['uploader_id'] !== $userId) sendJsonResponse(['success' => false, 'error' => 'Vous ne pouvez pas supprimer cette ressource.'], 403);
    $relations = $pdo->prepare("SELECT TABLE_NAME, COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE CONSTRAINT_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME = 'resources'");
    $relations->execute();
    foreach ($relations->fetchAll() as $relation) {
        $table = str_replace('`', '``', (string)$relation['TABLE_NAME']);
        $column = str_replace('`', '``', (string)$relation['COLUMN_NAME']);
        $dependency = $pdo->prepare("SELECT 1 FROM `{$table}` WHERE `{$column}` = :id LIMIT 1");
        $dependency->execute(['id' => $id]);
        if ($dependency->fetchColumn()) sendJsonResponse(['success' => false, 'error' => 'Suppression refusée : des données dépendent de cette ressource.'], 409);
    }
    $pdo->prepare('DELETE FROM resources WHERE id = :id')->execute(['id' => $id]);
    if (!empty($resource['storage_key'])) removeStoredResource((string)$resource['storage_key'], $resource['mime_type'] !== null ? (string)$resource['mime_type'] : null);
    sendJsonResponse(['success' => true]);
}

if ($title === '' || mb_strlen($title) > 200 || mb_strlen($description) > 65535) sendJsonResponse(['success' => false, 'error' => 'Titre obligatoire (200 caractères maximum) et description invalide.'], 400);
if (!in_array($type, ['document', 'cours', 'video', 'lien', 'image'], true)) sendJsonResponse(['success' => false, 'error' => 'Type de ressource invalide.'], 400);
$assertCourseAccess($courseId);

$old = null;
if ($action === 'update') {
    $stmt = $pdo->prepare('SELECT r.*, r.course_id AS existing_course_id FROM resources r WHERE r.id = :id');
    $stmt->execute(['id' => $id]);
    $old = $stmt->fetch();
    if (!$old) sendJsonResponse(['success' => false, 'error' => 'Ressource introuvable.'], 404);
    $assertCourseAccess($old['existing_course_id'] !== null ? (int)$old['existing_course_id'] : null);
    if ($role === 'teacher' && $old['existing_course_id'] === null && (int)$old['uploader_id'] !== $userId) sendJsonResponse(['success' => false, 'error' => 'Vous ne pouvez pas modifier cette ressource.'], 403);
} elseif ($action !== 'create') {
    sendJsonResponse(['success' => false, 'error' => 'Action inconnue.'], 400);
}

$externalUrl = null;
$uploadInfo = null;
$newKey = null;
$fileProvided = isset($_FILES['file']) && ($_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE;
if ($fileProvided) {
    if (!in_array($type, ['document', 'cours', 'image'], true)) sendJsonResponse(['success' => false, 'error' => 'Ce type de ressource ne peut pas contenir un fichier.'], 400);
    $uploadInfo = validateResourceUpload($_FILES['file']);
    if (($type === 'image') !== str_starts_with($uploadInfo['mime'], 'image/')) sendJsonResponse(['success' => false, 'error' => 'Le type de fichier ne correspond pas à la catégorie.'], 400);
    $newKey = saveResourceUpload($_FILES['file'], $uploadInfo);
} elseif (in_array($type, ['lien', 'video'], true)) {
    $externalUrl = trim((string)($input['external_url'] ?? ''));
    if (strlen($externalUrl) > 2048 || !filter_var($externalUrl, FILTER_VALIDATE_URL) || !in_array(strtolower((string)parse_url($externalUrl, PHP_URL_SCHEME)), ['http', 'https'], true)) {
        sendJsonResponse(['success' => false, 'error' => 'URL HTTP(S) invalide.'], 400);
    }
} elseif ($action === 'create' || (!$old || empty($old['storage_key']))) {
    sendJsonResponse(['success' => false, 'error' => 'Un fichier est requis pour cette ressource.'], 400);
}

if ($newKey !== null) {
    $fileFormat = strtoupper($uploadInfo['extension']);
    $fileSize = number_format($uploadInfo['size'] / 1048576, 2, ',', ' ') . ' Mo';
    $fileUrl = '';
    $storageKey = $newKey;
    $mimeType = $uploadInfo['mime'];
    $sizeBytes = $uploadInfo['size'];
} elseif ($externalUrl !== null) {
    $fileFormat = strtoupper((string)parse_url($externalUrl, PHP_URL_HOST));
    $fileSize = '—';
    $fileUrl = '';
    $storageKey = null;
    $mimeType = null;
    $sizeBytes = null;
} else {
    if ($type === 'image' && !str_starts_with((string)($old['mime_type'] ?? ''), 'image/')) sendJsonResponse(['success' => false, 'error' => 'Un fichier image est requis pour ce type.'], 400);
    if (in_array($type, ['document', 'cours'], true) && str_starts_with((string)($old['mime_type'] ?? ''), 'image/')) sendJsonResponse(['success' => false, 'error' => 'Cette image ne peut pas être classée comme document.'], 400);
    $fileFormat = $old['file_format'];
    $fileSize = $old['file_size'];
    $fileUrl = $old['file_url'];
    $storageKey = $old['storage_key'];
    $mimeType = $old['mime_type'];
    $sizeBytes = $old['file_size_bytes'];
    $externalUrl = $old['external_url'];
}

if ($action === 'create') {
    $stmt = $pdo->prepare('INSERT INTO resources (course_id, title, description, type, file_format, file_size, file_url, storage_key, mime_type, file_size_bytes, external_url, uploader_id, published_date) VALUES (:course_id, :title, :description, :type, :format, :size, :file_url, :storage_key, :mime, :bytes, :external_url, :uploader_id, CURRENT_DATE)');
    $stmt->execute(['course_id' => $courseId, 'title' => $title, 'description' => $description !== '' ? $description : null, 'type' => $type, 'format' => $fileFormat, 'size' => $fileSize, 'file_url' => $fileUrl, 'storage_key' => $storageKey, 'mime' => $mimeType, 'bytes' => $sizeBytes, 'external_url' => $externalUrl, 'uploader_id' => $userId]);
} else {
    $stmt = $pdo->prepare('UPDATE resources SET course_id = :course_id, title = :title, description = :description, type = :type, file_format = :format, file_size = :size, file_url = :file_url, storage_key = :storage_key, mime_type = :mime, file_size_bytes = :bytes, external_url = :external_url WHERE id = :id');
    $stmt->execute(['course_id' => $courseId, 'title' => $title, 'description' => $description !== '' ? $description : null, 'type' => $type, 'format' => $fileFormat, 'size' => $fileSize, 'file_url' => $fileUrl, 'storage_key' => $storageKey, 'mime' => $mimeType, 'bytes' => $sizeBytes, 'external_url' => $externalUrl, 'id' => $id]);
    if (($newKey !== null || $externalUrl !== null) && !empty($old['storage_key'])) removeStoredResource((string)$old['storage_key'], $old['mime_type'] !== null ? (string)$old['mime_type'] : null);
}
sendJsonResponse(['success' => true, 'id' => $action === 'create' ? (int)$pdo->lastInsertId() : $id], $action === 'create' ? 201 : 200);
<?php
/** Téléchargement contrôlé des ressources stockées hors de la racine publique. */
declare(strict_types=1);
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../resource_helpers.php';

$user = checkAuth();
$pdo = getDB();
$id = (int)($_GET['id'] ?? 0);
$stmt = $pdo->prepare('SELECT r.id, r.course_id, r.title, r.storage_key, r.mime_type, r.file_size_bytes, c.teacher_id, c.is_published FROM resources r LEFT JOIN courses c ON c.id = r.course_id WHERE r.id = :id LIMIT 1');
$stmt->execute(['id' => $id]);
$resource = $stmt->fetch();
if (!$resource || empty($resource['storage_key']) || empty($resource['mime_type'])) { http_response_code(404); exit; }
$role = (string)$user['role'];
$userId = (int)$user['id'];
if ($role === 'student' && $resource['course_id'] !== null) {
    $enrollment = $pdo->prepare("SELECT 1 FROM enrollments WHERE user_id = :uid AND course_id = :cid AND status IN ('en_cours', 'termine') LIMIT 1");
    $enrollment->execute(['uid' => $userId, 'cid' => (int)$resource['course_id']]);
    if (!$enrollment->fetchColumn() || (int)$resource['is_published'] !== 1) { http_response_code(403); exit; }
} elseif ($role === 'teacher' && $resource['course_id'] !== null && (int)$resource['teacher_id'] !== $userId) {
    http_response_code(403); exit;
} elseif (!in_array($role, ['student', 'teacher', 'admin'], true)) {
    http_response_code(403); exit;
}

$extensions = [
    'application/pdf' => ['pdf'], 'application/vnd.ms-powerpoint' => ['ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation' => ['pptx'],
    'application/msword' => ['doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => ['docx'],
    'application/vnd.ms-excel' => ['xls'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => ['xlsx'],
    'image/jpeg' => ['jpg', 'jpeg'], 'image/png' => ['png'], 'image/gif' => ['gif'], 'image/webp' => ['webp'],
];
$directory = realpath(resourceStorageDirectory());
$path = null;
foreach ($extensions[(string)$resource['mime_type']] ?? [] as $extension) {
    $candidate = $directory ? realpath($directory . DIRECTORY_SEPARATOR . $resource['storage_key'] . '.' . $extension) : false;
    if ($candidate && str_starts_with($candidate, $directory . DIRECTORY_SEPARATOR) && is_file($candidate)) { $path = $candidate; break; }
}
if (!$path) { http_response_code(404); exit; }
$extension = pathinfo($path, PATHINFO_EXTENSION);
$downloadName = preg_replace('/[^\pL\pN ._-]+/u', '_', (string)$resource['title']) ?: 'ressource';
header('Content-Type: ' . $resource['mime_type']);
header('Content-Length: ' . filesize($path));
header('X-Content-Type-Options: nosniff');
header('Content-Disposition: attachment; filename="' . rawurlencode($downloadName . '.' . $extension) . '"');
readfile($path);
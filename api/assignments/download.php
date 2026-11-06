<?php
declare(strict_types=1);
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/storage.php';

$user = checkAuth(['student', 'teacher', 'admin']);
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    http_response_code(405);
    exit;
}
$pdo = getDB();
$kind = (string)($_GET['kind'] ?? 'submission');
$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) { http_response_code(404); exit; }

if ($kind === 'assignment') {
    $stmt = $pdo->prepare('SELECT a.attachment_key AS storage_key, a.attachment_extension AS file_extension, a.attachment_mime AS mime_type, a.attachment_name AS original_file_name, c.teacher_id, c.is_published AS course_published, a.course_id, a.is_published AS assignment_published, a.publication_date, a.archived_at FROM assignments a JOIN courses c ON c.id = a.course_id WHERE a.id = :id LIMIT 1');
    $stmt->execute(['id' => $id]);
    $file = $stmt->fetch();
    if (!$file || !$file['storage_key']) { http_response_code(404); exit; }
    if ($user['role'] === 'student') {
        $access = $pdo->prepare("SELECT 1 FROM enrollments WHERE user_id = :uid AND course_id = :cid AND status IN ('en_cours', 'termine') LIMIT 1");
        $access->execute(['uid' => (int)$user['id'], 'cid' => (int)$file['course_id']]);
        if (!$access->fetchColumn() || (int)$file['course_published'] !== 1 || (int)$file['assignment_published'] !== 1 || $file['archived_at'] !== null || ($file['publication_date'] !== null && strtotime($file['publication_date']) > time())) { http_response_code(403); exit; }
    } elseif ($user['role'] === 'teacher' && (int)$file['teacher_id'] !== (int)$user['id']) {
        http_response_code(403); exit;
    }
} elseif ($kind === 'submission') {
    $stmt = $pdo->prepare('SELECT s.storage_key, s.file_extension, s.mime_type, s.original_file_name, s.user_id, c.teacher_id FROM assignment_submissions s JOIN assignments a ON a.id = s.assignment_id JOIN courses c ON c.id = a.course_id WHERE s.id = :id LIMIT 1');
    $stmt->execute(['id' => $id]);
    $file = $stmt->fetch();
    if (!$file || !$file['storage_key']) { http_response_code(404); exit; }
    if ($user['role'] === 'student' && (int)$file['user_id'] !== (int)$user['id']) { http_response_code(403); exit; }
    if ($user['role'] === 'teacher' && (int)$file['teacher_id'] !== (int)$user['id']) { http_response_code(403); exit; }
} else {
    http_response_code(404);
    exit;
}

$path = resolveAssignmentUpload($file['storage_key'], $file['file_extension']);
if (!$path) { http_response_code(404); exit; }
$downloadName = preg_replace('/[^\pL\pN ._-]+/u', '_', (string)$file['original_file_name']) ?: 'devoir.' . $file['file_extension'];
header('Content-Type: ' . $file['mime_type']);
header('Content-Length: ' . filesize($path));
header('X-Content-Type-Options: nosniff');
header('Content-Disposition: attachment; filename="' . rawurlencode($downloadName) . '"');
readfile($path);

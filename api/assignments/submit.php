<?php
declare(strict_types=1);
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/storage.php';

$user = checkAuth(['student']);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    sendJsonResponse(['success' => false, 'error' => 'Méthode POST requise.'], 405);
}
verifyCsrfToken();
$assignmentId = (int)($_POST['assignment_id'] ?? 0);
$comment = trim((string)($_POST['student_comment'] ?? ''));
$userId = (int)$user['id'];
if ($assignmentId <= 0 || mb_strlen($comment) > 5000) {
    sendJsonResponse(['success' => false, 'error' => 'Identifiant de devoir ou commentaire invalide.'], 400);
}
$file = $_FILES['file'] ?? null;
if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
    sendJsonResponse(['success' => false, 'error' => 'Sélectionnez un fichier à déposer.'], 400);
}
$metadata = validateAssignmentUpload($file);

$pdo = getDB();
$stmt = $pdo->prepare('SELECT a.id, a.course_id, a.due_date, a.publication_date, a.is_published, a.archived_at FROM assignments a WHERE a.id = :id LIMIT 1');
$stmt->execute(['id' => $assignmentId]);
$assignment = $stmt->fetch();
if (!$assignment) sendJsonResponse(['success' => false, 'error' => 'Devoir introuvable.'], 404);
if ((int)$assignment['is_published'] !== 1 || $assignment['archived_at'] !== null || ($assignment['publication_date'] !== null && strtotime($assignment['publication_date']) > time())) {
    sendJsonResponse(['success' => false, 'error' => 'Ce devoir n’est pas ouvert aux dépôts.'], 403);
}
$enrollment = $pdo->prepare("SELECT 1 FROM enrollments WHERE user_id = :uid AND course_id = :cid AND status IN ('en_cours', 'termine') LIMIT 1");
$enrollment->execute(['uid' => $userId, 'cid' => (int)$assignment['course_id']]);
if (!$enrollment->fetchColumn()) sendJsonResponse(['success' => false, 'error' => 'Vous devez être inscrit à ce cours pour déposer un devoir.'], 403);

$existingStmt = $pdo->prepare('SELECT id, status, storage_key, file_extension FROM assignment_submissions WHERE assignment_id = :aid AND user_id = :uid LIMIT 1');
$existingStmt->execute(['aid' => $assignmentId, 'uid' => $userId]);
$existing = $existingStmt->fetch();
if ($existing && $existing['status'] === 'corrige') {
    sendJsonResponse(['success' => false, 'error' => 'Une soumission corrigée ne peut plus être remplacée.'], 409);
}

$newKey = saveAssignmentUpload($file, $metadata);
$now = new DateTimeImmutable('now');
$status = $now > new DateTimeImmutable((string)$assignment['due_date']) ? 'en_retard' : 'rendu';
$oldKey = $existing['storage_key'] ?? null;
$oldExtension = $existing['file_extension'] ?? null;
try {
    if ($existing) {
        $save = $pdo->prepare('UPDATE assignment_submissions SET file_url = NULL, storage_key = :storage_key, original_file_name = :file_name, file_extension = :extension, mime_type = :mime, file_size_bytes = :size, student_comment = :comment, grade_value = NULL, teacher_feedback = NULL, status = :status, submitted_at = CURRENT_TIMESTAMP, graded_at = NULL WHERE id = :id');
        $save->execute([
            'storage_key' => $newKey, 'file_name' => $metadata['name'], 'extension' => $metadata['extension'],
            'mime' => $metadata['mime'], 'size' => $metadata['size'], 'comment' => $comment !== '' ? $comment : null,
            'status' => $status, 'id' => (int)$existing['id'],
        ]);
    } else {
        $save = $pdo->prepare('INSERT INTO assignment_submissions (assignment_id, user_id, file_url, storage_key, original_file_name, file_extension, mime_type, file_size_bytes, student_comment, status, submitted_at) VALUES (:aid, :uid, NULL, :storage_key, :file_name, :extension, :mime, :size, :comment, :status, CURRENT_TIMESTAMP)');
        $save->execute([
            'aid' => $assignmentId, 'uid' => $userId, 'storage_key' => $newKey,
            'file_name' => $metadata['name'], 'extension' => $metadata['extension'], 'mime' => $metadata['mime'],
            'size' => $metadata['size'], 'comment' => $comment !== '' ? $comment : null, 'status' => $status,
        ]);
    }
} catch (Throwable $error) {
    removeAssignmentUpload($newKey, $metadata['extension']);
    throw $error;
}
if ($oldKey) removeAssignmentUpload($oldKey, $oldExtension);

sendJsonResponse([
    'success' => true,
    'message' => $existing ? 'Votre soumission a été remplacée.' : 'Devoir déposé avec succès.',
    'status' => $status,
    'submitted_at' => date('Y-m-d H:i:s'),
]);

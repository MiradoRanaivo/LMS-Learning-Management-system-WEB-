<?php
declare(strict_types=1);
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/storage.php';

$user = checkAuth(['teacher', 'admin']);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    sendJsonResponse(['success' => false, 'error' => 'Méthode POST requise.'], 405);
}
verifyCsrfToken();
$pdo = getDB();
$role = (string)$user['role'];
$userId = (int)$user['id'];
$input = $_POST;
if (!$input && str_contains((string)($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) {
    $decoded = json_decode(file_get_contents('php://input'), true);
    $input = is_array($decoded) ? $decoded : [];
}
$action = strtolower((string)($input['action'] ?? 'save'));
$assignmentId = (int)($input['id'] ?? 0);

$assignment = null;
if ($assignmentId > 0) {
    $stmt = $pdo->prepare('SELECT a.*, c.teacher_id FROM assignments a JOIN courses c ON c.id = a.course_id WHERE a.id = :id LIMIT 1');
    $stmt->execute(['id' => $assignmentId]);
    $assignment = $stmt->fetch();
    if (!$assignment) sendJsonResponse(['success' => false, 'error' => 'Devoir introuvable.'], 404);
    if ($role === 'teacher' && (int)$assignment['teacher_id'] !== $userId) {
        sendJsonResponse(['success' => false, 'error' => 'Vous ne pouvez gérer que les devoirs de vos cours.'], 403);
    }
}

if (in_array($action, ['publish', 'unpublish', 'archive'], true)) {
    if (!$assignment) sendJsonResponse(['success' => false, 'error' => 'Identifiant de devoir invalide.'], 400);
    if ($action === 'publish') {
        $stmt = $pdo->prepare('UPDATE assignments SET is_published = 1, archived_at = NULL WHERE id = :id');
    } elseif ($action === 'unpublish') {
        $stmt = $pdo->prepare('UPDATE assignments SET is_published = 0 WHERE id = :id');
    } else {
        $stmt = $pdo->prepare('UPDATE assignments SET is_published = 0, archived_at = CURRENT_TIMESTAMP WHERE id = :id');
    }
    $stmt->execute(['id' => $assignmentId]);
    sendJsonResponse(['success' => true, 'message' => 'Statut du devoir mis à jour.']);
}

if ($action === 'delete') {
    if (!$assignment) sendJsonResponse(['success' => false, 'error' => 'Identifiant de devoir invalide.'], 400);
    $count = $pdo->prepare('SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = :id');
    $count->execute(['id' => $assignmentId]);
    if ((int)$count->fetchColumn() > 0) {
        $pdo->prepare('UPDATE assignments SET is_published = 0, archived_at = CURRENT_TIMESTAMP WHERE id = :id')->execute(['id' => $assignmentId]);
        sendJsonResponse(['success' => true, 'archived' => true, 'message' => 'Le devoir possède des rendus : il a été archivé pour préserver l’historique.']);
    }
    $pdo->prepare('DELETE FROM assignments WHERE id = :id')->execute(['id' => $assignmentId]);
    removeAssignmentUpload($assignment['attachment_key'] ?? null, $assignment['attachment_extension'] ?? null);
    sendJsonResponse(['success' => true, 'message' => 'Devoir supprimé.']);
}

if (!in_array($action, ['create', 'update', 'save'], true)) {
    sendJsonResponse(['success' => false, 'error' => 'Action de gestion inconnue.'], 400);
}

$courseId = (int)($input['course_id'] ?? 0);
$title = trim((string)($input['title'] ?? ''));
$description = trim((string)($input['description'] ?? ''));
$instructions = trim((string)($input['instructions'] ?? ''));
$publicationDate = trim((string)($input['publication_date'] ?? ''));
$dueDate = trim((string)($input['due_date'] ?? ''));
$maxGradeRaw = (string)($input['max_grade'] ?? '');
$maxGrade = filter_var($maxGradeRaw, FILTER_VALIDATE_FLOAT);

if ($title === '' || mb_strlen($title) > 200 || $description === '' || mb_strlen($description) > 65535 || mb_strlen($instructions) > 65535 || $courseId <= 0 || $maxGrade === false || $maxGrade <= 0 || $maxGrade > 99.99) {
    sendJsonResponse(['success' => false, 'error' => 'Titre, description, cours ou barème invalide (0,01 à 99,99 points).'], 400);
}
$courseStmt = $pdo->prepare('SELECT id, teacher_id FROM courses WHERE id = :id LIMIT 1');
$courseStmt->execute(['id' => $courseId]);
$course = $courseStmt->fetch();
if (!$course) sendJsonResponse(['success' => false, 'error' => 'Cours introuvable.'], 404);
if ($role === 'teacher' && (int)$course['teacher_id'] !== $userId) {
    sendJsonResponse(['success' => false, 'error' => 'Vous ne pouvez associer un devoir qu’à vos propres cours.'], 403);
}
if ($assignment && (int)$assignment['course_id'] !== $courseId) {
    $hasSubmissions = $pdo->prepare('SELECT 1 FROM assignment_submissions WHERE assignment_id = :id LIMIT 1');
    $hasSubmissions->execute(['id' => $assignmentId]);
    if ($hasSubmissions->fetchColumn()) sendJsonResponse(['success' => false, 'error' => 'Le cours ne peut pas être modifié après réception de rendus.'], 409);
}

$toDatabaseDate = static function (string $value, bool $required): ?string {
    if ($value === '') {
        if ($required) sendJsonResponse(['success' => false, 'error' => 'Les dates de publication et d’échéance sont obligatoires.'], 400);
        return null;
    }
    $date = DateTimeImmutable::createFromFormat('Y-m-d\\TH:i', $value);
    $errors = DateTimeImmutable::getLastErrors();
    if (!$date || ($errors && ($errors['warning_count'] || $errors['error_count']))) {
        sendJsonResponse(['success' => false, 'error' => 'Format de date invalide.'], 400);
    }
    return $date->format('Y-m-d H:i:s');
};
$publicationDate = $toDatabaseDate($publicationDate, true);
$dueDate = $toDatabaseDate($dueDate, true);
if ($publicationDate && $dueDate && $publicationDate >= $dueDate) {
    sendJsonResponse(['success' => false, 'error' => 'La date limite doit être postérieure à la date de publication.'], 400);
}

$file = $_FILES['attachment'] ?? null;
$metadata = $file && ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE ? validateAssignmentUpload($file) : null;
$newKey = $metadata ? saveAssignmentUpload($file, $metadata) : null;
$oldKey = $assignment['attachment_key'] ?? null;
$oldExtension = $assignment['attachment_extension'] ?? null;
$removeAttachment = !empty($input['remove_attachment']);

try {
    if ($assignment) {
        $sql = 'UPDATE assignments SET course_id = :course_id, title = :title, description = :description, instructions = :instructions, publication_date = :publication_date, due_date = :due_date, max_grade = :max_grade';
        if ($metadata) $sql .= ', attachment_key = :attachment_key, attachment_name = :attachment_name, attachment_extension = :attachment_extension, attachment_mime = :attachment_mime, attachment_size = :attachment_size';
        elseif ($removeAttachment) $sql .= ', attachment_key = NULL, attachment_name = NULL, attachment_extension = NULL, attachment_mime = NULL, attachment_size = NULL';
        $sql .= ' WHERE id = :id';
        $params = [
            'course_id' => $courseId, 'title' => $title, 'description' => $description,
            'instructions' => $instructions !== '' ? $instructions : null,
            'publication_date' => $publicationDate, 'due_date' => $dueDate,
            'max_grade' => number_format((float)$maxGrade, 2, '.', ''), 'id' => $assignmentId,
        ];
        if ($metadata) {
            $params += ['attachment_key' => $newKey, 'attachment_name' => $metadata['name'], 'attachment_extension' => $metadata['extension'], 'attachment_mime' => $metadata['mime'], 'attachment_size' => $metadata['size']];
        }
        $pdo->prepare($sql)->execute($params);
        if (($metadata || $removeAttachment) && $oldKey) removeAssignmentUpload($oldKey, $oldExtension);
    } else {
        $stmt = $pdo->prepare('INSERT INTO assignments (course_id, title, description, instructions, publication_date, due_date, max_grade, is_published, attachment_key, attachment_name, attachment_extension, attachment_mime, attachment_size) VALUES (:course_id, :title, :description, :instructions, :publication_date, :due_date, :max_grade, 0, :attachment_key, :attachment_name, :attachment_extension, :attachment_mime, :attachment_size)');
        $stmt->execute([
            'course_id' => $courseId, 'title' => $title, 'description' => $description,
            'instructions' => $instructions !== '' ? $instructions : null,
            'publication_date' => $publicationDate, 'due_date' => $dueDate,
            'max_grade' => number_format((float)$maxGrade, 2, '.', ''),
            'attachment_key' => $newKey,
            'attachment_name' => $metadata['name'] ?? null,
            'attachment_extension' => $metadata['extension'] ?? null,
            'attachment_mime' => $metadata['mime'] ?? null,
            'attachment_size' => $metadata['size'] ?? null,
        ]);
        $assignmentId = (int)$pdo->lastInsertId();
    }
} catch (Throwable $error) {
    if ($newKey) removeAssignmentUpload($newKey, $metadata['extension']);
    throw $error;
}

sendJsonResponse(['success' => true, 'assignment_id' => $assignmentId, 'message' => 'Devoir enregistré en brouillon.']);

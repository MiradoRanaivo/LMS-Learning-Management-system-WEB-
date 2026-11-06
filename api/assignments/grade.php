<?php
declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth(['teacher', 'admin']);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    sendJsonResponse(['success' => false, 'error' => 'Méthode POST requise.'], 405);
}
verifyCsrfToken();

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) $input = $_POST;
$submissionId = (int)($input['submission_id'] ?? 0);
$gradeRaw = $input['grade_value'] ?? null;
$feedback = trim((string)($input['teacher_feedback'] ?? ''));

if ($submissionId <= 0 || !is_numeric($gradeRaw) || mb_strlen($feedback) > 5000) {
    sendJsonResponse(['success' => false, 'error' => 'Identifiant, note ou commentaire invalide.'], 400);
}
$gradeValue = (float)$gradeRaw;

$pdo = getDB();

$ownership = $pdo->prepare('SELECT s.user_id, a.max_grade, c.teacher_id FROM assignment_submissions s JOIN assignments a ON a.id = s.assignment_id JOIN courses c ON c.id = a.course_id WHERE s.id = :id LIMIT 1');
$ownership->execute(['id' => $submissionId]);
$submission = $ownership->fetch();
if (!$submission) sendJsonResponse(['success' => false, 'error' => 'Soumission introuvable.'], 404);
if ($user['role'] === 'teacher' && (int)$submission['teacher_id'] !== (int)$user['id']) {
    sendJsonResponse(['success' => false, 'error' => 'Vous ne pouvez corriger que les devoirs de vos cours.'], 403);
}
if ($gradeValue < 0 || $gradeValue > (float)$submission['max_grade']) {
    sendJsonResponse(['success' => false, 'error' => 'La note doit être comprise entre 0 et le barème du devoir (' . $submission['max_grade'] . ').'], 400);
}

$stmt = $pdo->prepare("
    UPDATE assignment_submissions
    SET grade_value = :grade,
        teacher_feedback = :feed,
        status = 'corrige',
        grade_published = 0,
        graded_at = CURRENT_TIMESTAMP
    WHERE id = :id
");
$stmt->execute([
    'grade' => number_format($gradeValue, 2, '.', ''),
    'feed' => $feedback !== '' ? $feedback : null,
    'id' => $submissionId
]);

$notifStmt = $pdo->prepare("INSERT INTO notifications (user_id, title, message, type, link_url) VALUES (:uid, 'Nouvelle note attribuée', :msg, 'grade', 'assignments.html')");
$notifStmt->execute([
    'uid' => (int)$submission['user_id'],
    'msg' => 'Votre devoir a été corrigé. La note sera disponible après sa publication par l’enseignant.'
]);

sendJsonResponse([
    'success' => true,
    'message' => 'Note et appréciation enregistrées avec succès !',
    'grade_value' => $gradeValue,
    'max_grade' => (float)$submission['max_grade'],
    'teacher_feedback' => $feedback
]);

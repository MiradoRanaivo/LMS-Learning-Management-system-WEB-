<?php
/**
 * Publish or unpublish a course grade, assignment grade, or quiz result.
 * POST /api/grades/publication.php
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth(['teacher', 'admin']);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'error' => 'Méthode POST requise.'], 405);
}
verifyCsrfToken();
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$type = strtolower(trim((string)($input['type'] ?? '')));
$action = strtolower(trim((string)($input['action'] ?? '')));
$published = $action === 'publish' ? 1 : ($action === 'unpublish' ? 0 : -1);
if (!in_array($type, ['course_grade', 'assignment', 'quiz'], true) || $published < 0) {
    sendJsonResponse(['success' => false, 'error' => 'Type ou action de publication invalide.'], 400);
}

$pdo = getDB();
$userId = (int)$user['id'];
$teacherOnly = $user['role'] === 'teacher';
if ($type === 'course_grade') {
    $gradeId = (int)($input['grade_id'] ?? 0);
    if ($gradeId <= 0) sendJsonResponse(['success' => false, 'error' => 'Identifiant de note invalide.'], 400);
    $sql = 'SELECT g.id, g.user_id, g.is_published, c.teacher_id, c.title AS course_title FROM grades g JOIN courses c ON c.id = g.course_id WHERE g.id = :id LIMIT 1';
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id' => $gradeId]);
    $grade = $stmt->fetch();
    if (!$grade) sendJsonResponse(['success' => false, 'error' => 'Note introuvable.'], 404);
    if ($teacherOnly && (int)$grade['teacher_id'] !== $userId) sendJsonResponse(['success' => false, 'error' => 'Cette note ne fait pas partie de vos cours.'], 403);
    $update = $pdo->prepare('UPDATE grades SET is_published = :published WHERE id = :id');
    $update->execute(['published' => $published, 'id' => $gradeId]);
    if ($published && !(int)$grade['is_published']) {
        $notice = $pdo->prepare("INSERT INTO notifications (user_id,title,message,type,link_url) VALUES (:user_id,'Nouvelle note publiée',:message,'grade','grades.html')");
        $notice->execute(['user_id' => (int)$grade['user_id'], 'message' => 'Une note de cours a été publiée pour ' . $grade['course_title'] . '.']);
    }
} elseif ($type === 'assignment') {
    $submissionId = (int)($input['submission_id'] ?? 0);
    if ($submissionId <= 0) sendJsonResponse(['success' => false, 'error' => 'Identifiant de soumission invalide.'], 400);
    $stmt = $pdo->prepare('SELECT s.id, s.user_id, s.status, s.grade_value, s.grade_published, a.title AS assignment_title, a.max_grade, c.teacher_id FROM assignment_submissions s JOIN assignments a ON a.id = s.assignment_id JOIN courses c ON c.id = a.course_id WHERE s.id = :id LIMIT 1');
    $stmt->execute(['id' => $submissionId]);
    $submission = $stmt->fetch();
    if (!$submission) sendJsonResponse(['success' => false, 'error' => 'Soumission introuvable.'], 404);
    if ($teacherOnly && (int)$submission['teacher_id'] !== $userId) sendJsonResponse(['success' => false, 'error' => 'Cette soumission ne fait pas partie de vos cours.'], 403);
    if ($published && ($submission['status'] !== 'corrige' || $submission['grade_value'] === null)) {
        sendJsonResponse(['success' => false, 'error' => 'Corrigez la soumission avant de publier sa note.'], 409);
    }
    $update = $pdo->prepare('UPDATE assignment_submissions SET grade_published = :published WHERE id = :id');
    $update->execute(['published' => $published, 'id' => $submissionId]);
    if ($published && !(int)$submission['grade_published']) {
        $notice = $pdo->prepare("INSERT INTO notifications (user_id,title,message,type,link_url) VALUES (:user_id,'Nouvelle note publiée',:message,'grade','assignments.html')");
        $notice->execute(['user_id' => (int)$submission['user_id'], 'message' => 'Votre devoir « ' . $submission['assignment_title'] . ' » est noté ' . number_format((float)$submission['grade_value'], 2) . ' / ' . number_format((float)$submission['max_grade'], 2) . '.']);
    }
} else {
    $attemptId = (int)($input['attempt_id'] ?? 0);
    if ($attemptId <= 0) sendJsonResponse(['success' => false, 'error' => 'Identifiant de tentative invalide.'], 400);
    $stmt = $pdo->prepare('SELECT a.id, a.user_id, a.manual_review, a.status, a.result_published, q.title AS quiz_title, a.percentage, c.teacher_id FROM quiz_attempts a JOIN quizzes q ON q.id = a.quiz_id JOIN courses c ON c.id = q.course_id WHERE a.id = :id LIMIT 1');
    $stmt->execute(['id' => $attemptId]);
    $attempt = $stmt->fetch();
    if (!$attempt) sendJsonResponse(['success' => false, 'error' => 'Tentative introuvable.'], 404);
    if ($teacherOnly && (int)$attempt['teacher_id'] !== $userId) sendJsonResponse(['success' => false, 'error' => 'Cette tentative ne fait pas partie de vos cours.'], 403);
    if ($published && ((int)$attempt['manual_review'] === 1 || !in_array($attempt['status'], ['passed', 'failed'], true))) {
        sendJsonResponse(['success' => false, 'error' => 'Terminez la correction manuelle avant de publier ce résultat.'], 409);
    }
    $update = $pdo->prepare('UPDATE quiz_attempts SET result_published = :published WHERE id = :id');
    $update->execute(['published' => $published, 'id' => $attemptId]);
    if ($published && !(int)$attempt['result_published']) {
        $notice = $pdo->prepare("INSERT INTO notifications (user_id,title,message,type,link_url) VALUES (:user_id,'Résultat publié',:message,'grade','grades.html')");
        $notice->execute(['user_id' => (int)$attempt['user_id'], 'message' => 'Votre résultat à « ' . $attempt['quiz_title'] . ' » est publié : ' . number_format((float)$attempt['percentage'], 2) . ' %.']);
    }
}

sendJsonResponse(['success' => true, 'type' => $type, 'published' => (bool)$published]);

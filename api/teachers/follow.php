<?php
/**
 * Suivi des enseignants par les étudiants.
 * GET : liste des enseignants et statut de suivi.
 * POST : suivre ou ne plus suivre un enseignant.
 */
declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth(['student']);
$pdo = getDB();
$studentId = (int)$user['id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("
        SELECT u.id, u.firstname, u.lastname, u.bio, u.avatar_url, u.avatar_initials,
               COUNT(DISTINCT c.id) AS published_courses_count,
               COUNT(DISTINCT tf2.student_id) AS followers_count,
               MAX(CASE WHEN tf.student_id IS NOT NULL THEN 1 ELSE 0 END) AS is_following
        FROM users u
        LEFT JOIN courses c ON c.teacher_id = u.id AND c.is_published = 1
        LEFT JOIN teacher_follows tf ON tf.teacher_id = u.id AND tf.student_id = :student_id
        LEFT JOIN teacher_follows tf2 ON tf2.teacher_id = u.id
        WHERE u.role = 'teacher' AND u.status = 'active'
        GROUP BY u.id, u.firstname, u.lastname, u.bio, u.avatar_url, u.avatar_initials
        ORDER BY u.lastname ASC, u.firstname ASC
    ");
    $stmt->execute(['student_id' => $studentId]);
    sendJsonResponse(['success' => true, 'teachers' => $stmt->fetchAll()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrfToken();
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $teacherId = (int)($input['teacher_id'] ?? 0);
    $action = strtolower((string)($input['action'] ?? 'follow'));
    if ($teacherId <= 0 || !in_array($action, ['follow', 'unfollow'], true)) {
        sendJsonResponse(['success' => false, 'error' => 'Demande de suivi invalide.'], 400);
    }
    $teacherCheck = $pdo->prepare("SELECT id FROM users WHERE id = :id AND role = 'teacher' AND status = 'active' LIMIT 1");
    $teacherCheck->execute(['id' => $teacherId]);
    if (!$teacherCheck->fetchColumn()) {
        sendJsonResponse(['success' => false, 'error' => 'Enseignant introuvable.'], 404);
    }

    if ($action === 'follow') {
        $stmt = $pdo->prepare('INSERT IGNORE INTO teacher_follows (student_id, teacher_id) VALUES (:student_id, :teacher_id)');
        $stmt->execute(['student_id' => $studentId, 'teacher_id' => $teacherId]);
        sendJsonResponse(['success' => true, 'is_following' => true, 'message' => 'Vous suivez maintenant cet enseignant.']);
    }

    $stmt = $pdo->prepare('DELETE FROM teacher_follows WHERE student_id = :student_id AND teacher_id = :teacher_id');
    $stmt->execute(['student_id' => $studentId, 'teacher_id' => $teacherId]);
    sendJsonResponse(['success' => true, 'is_following' => false, 'message' => 'Vous ne suivez plus cet enseignant.']);
}

sendJsonResponse(['success' => false, 'error' => 'Méthode non autorisée.'], 405);

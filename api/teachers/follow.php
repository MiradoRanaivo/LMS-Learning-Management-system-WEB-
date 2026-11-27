<?php
/**
 * Suivi des enseignants par les étudiants.
 * Étudiant : consulter les professeurs et demander/ne plus demander un suivi.
 * Enseignant : consulter les demandes et les approuver/refuser.
 */
declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth(['student', 'teacher']);
$pdo = getDB();
$userId = (int)$user['id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $user['role'] === 'teacher') {
    $stmt = $pdo->prepare("
        SELECT tf.id AS request_id, tf.status, tf.followed_at,
               u.id, u.firstname, u.lastname, u.email, u.avatar_url, u.avatar_initials,
               u.department, u.student_id
        FROM teacher_follows tf
        JOIN users u ON u.id = tf.student_id
        WHERE tf.teacher_id = :teacher_id
        ORDER BY CASE tf.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,
                 tf.followed_at DESC
    ");
    $stmt->execute(['teacher_id' => $userId]);
    sendJsonResponse(['success' => true, 'requests' => $stmt->fetchAll()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("
        SELECT u.id, u.firstname, u.lastname, u.bio, u.avatar_url, u.avatar_initials,
               COUNT(DISTINCT c.id) AS published_courses_count,
               COUNT(DISTINCT CASE WHEN tf2.status = 'approved' THEN tf2.student_id END) AS followers_count,
               MAX(CASE WHEN tf.student_id IS NOT NULL THEN tf.status ELSE NULL END) AS follow_status
        FROM users u
        LEFT JOIN courses c ON c.teacher_id = u.id AND c.is_published = 1
        LEFT JOIN teacher_follows tf ON tf.teacher_id = u.id AND tf.student_id = :student_id
        LEFT JOIN teacher_follows tf2 ON tf2.teacher_id = u.id
        WHERE u.role = 'teacher' AND u.status = 'active'
        GROUP BY u.id, u.firstname, u.lastname, u.bio, u.avatar_url, u.avatar_initials
        ORDER BY u.lastname ASC, u.firstname ASC
    ");
    $stmt->execute(['student_id' => $userId]);
    sendJsonResponse(['success' => true, 'teachers' => $stmt->fetchAll()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrfToken();
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $teacherId = (int)($input['teacher_id'] ?? 0);
    $studentId = (int)($input['student_id'] ?? 0);
    $action = strtolower((string)($input['action'] ?? 'follow'));

    if (!in_array($action, ['follow', 'unfollow', 'approve', 'reject'], true)) {
        sendJsonResponse(['success' => false, 'error' => 'Action de suivi invalide.'], 400);
    }

    if (in_array($action, ['follow', 'unfollow'], true)) {
        if ($user['role'] !== 'student' || $teacherId <= 0) {
            sendJsonResponse(['success' => false, 'error' => 'Demande de suivi invalide.'], 400);
        }
        $teacherCheck = $pdo->prepare("SELECT id FROM users WHERE id = :id AND role = 'teacher' AND status = 'active' LIMIT 1");
        $teacherCheck->execute(['id' => $teacherId]);
        if (!$teacherCheck->fetchColumn()) {
            sendJsonResponse(['success' => false, 'error' => 'Enseignant introuvable.'], 404);
        }

        if ($action === 'follow') {
            $stmt = $pdo->prepare("INSERT INTO teacher_follows (student_id, teacher_id, status) VALUES (:student_id, :teacher_id, 'pending') ON DUPLICATE KEY UPDATE status = IF(status = 'rejected', 'pending', status), followed_at = IF(status = 'rejected', CURRENT_TIMESTAMP, followed_at), reviewed_at = NULL");
            $stmt->execute(['student_id' => $userId, 'teacher_id' => $teacherId]);
            sendJsonResponse(['success' => true, 'follow_status' => 'pending', 'message' => 'Demande envoyée. Elle sera visible après validation du professeur.']);
        }

        $stmt = $pdo->prepare('DELETE FROM teacher_follows WHERE student_id = :student_id AND teacher_id = :teacher_id');
        $stmt->execute(['student_id' => $userId, 'teacher_id' => $teacherId]);
        sendJsonResponse(['success' => true, 'follow_status' => null, 'message' => 'Demande ou suivi annulé.']);
    }

    if ($user['role'] !== 'teacher' || $studentId <= 0) {
        sendJsonResponse(['success' => false, 'error' => 'Action réservée au professeur concerné.'], 403);
    }
    $status = $action === 'approve' ? 'approved' : 'rejected';
    $stmt = $pdo->prepare('UPDATE teacher_follows SET status = :status, reviewed_at = CURRENT_TIMESTAMP WHERE student_id = :student_id AND teacher_id = :teacher_id AND status = \'pending\'');
    $stmt->execute(['status' => $status, 'student_id' => $studentId, 'teacher_id' => $userId]);
    if ($stmt->rowCount() === 0) {
        sendJsonResponse(['success' => false, 'error' => 'Cette demande n’est plus en attente.'], 409);
    }
    sendJsonResponse(['success' => true, 'follow_status' => $status, 'message' => $status === 'approved' ? 'Demande approuvée.' : 'Demande refusée.']);
}

sendJsonResponse(['success' => false, 'error' => 'Méthode non autorisée.'], 405);

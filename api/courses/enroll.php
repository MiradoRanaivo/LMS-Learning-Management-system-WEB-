<?php
/**
 * LMS Web - Gestion des inscriptions aux cours
 * Méthodes : GET / POST
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth();
$pdo = getDB();
$role = (string)$user['role'];
$userId = (int)$user['id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $courseId = isset($_GET['course_id']) && $_GET['course_id'] !== '' ? (int)$_GET['course_id'] : null;

    if ($role === 'student') {
        $sql = "
            SELECT e.id, e.user_id, e.course_id, e.status, e.enrolled_at, e.completed_at,
                   c.code, c.title, c.is_published, c.teacher_id,
                   u.firstname AS teacher_firstname, u.lastname AS teacher_lastname
            FROM enrollments e
            JOIN courses c ON c.id = e.course_id
            JOIN users u ON u.id = c.teacher_id
            WHERE e.user_id = :uid
            ORDER BY e.enrolled_at DESC
        ";
        $params = ['uid' => $userId];

        if ($courseId !== null) {
            $sql = str_replace(' ORDER BY e.enrolled_at DESC', ' AND e.course_id = :cid ORDER BY e.enrolled_at DESC', $sql);
            $params['cid'] = $courseId;
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $enrollments = $stmt->fetchAll();

        sendJsonResponse([
            'success' => true,
            'enrollments' => $enrollments,
            'csrf_token' => getCsrfToken(),
        ]);
    }

    if (in_array($role, ['teacher', 'admin'], true)) {
        $sql = "
            SELECT e.id, e.user_id, e.course_id, e.status, e.enrolled_at, e.completed_at,
                   c.code, c.title AS course_title, c.is_published,
                   u.firstname AS student_firstname, u.lastname AS student_lastname,
                   u.email AS student_email,
                   t.firstname AS teacher_firstname, t.lastname AS teacher_lastname
            FROM enrollments e
            JOIN users u ON u.id = e.user_id
            JOIN courses c ON c.id = e.course_id
            JOIN users t ON t.id = c.teacher_id
            WHERE 1 = 1
        ";
        $params = [];

        if ($role === 'teacher') {
            $sql .= ' AND c.teacher_id = :teacher_id';
            $params['teacher_id'] = $userId;
        }

        if ($courseId !== null) {
            $sql .= ' AND e.course_id = :cid';
            $params['cid'] = $courseId;
        }

        $sql .= ' ORDER BY e.enrolled_at DESC';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        sendJsonResponse([
            'success' => true,
            'enrollments' => $stmt->fetchAll(),
            'csrf_token' => getCsrfToken(),
        ]);
    }

    sendJsonResponse(['success' => false, 'error' => 'Type d’accès invalide pour les inscriptions.'], 403);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: GET, POST');
    sendJsonResponse(['success' => false, 'error' => 'Méthode non autorisée.'], 405);
}

verifyCsrfToken();

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$action = strtolower((string)($input['action'] ?? 'enroll'));
$courseId = isset($input['course_id']) && $input['course_id'] !== '' ? (int)$input['course_id'] : 0;

if ($courseId <= 0) {
    sendJsonResponse(['success' => false, 'error' => 'Identifiant de cours invalide.'], 400);
}

$courseStmt = $pdo->prepare('SELECT id, title, is_published, teacher_id FROM courses WHERE id = :id LIMIT 1');
$courseStmt->execute(['id' => $courseId]);
$course = $courseStmt->fetch();

if (!$course) {
    sendJsonResponse(['success' => false, 'error' => 'Cours introuvable.'], 404);
}

if ((int)$course['is_published'] !== 1) {
    sendJsonResponse(['success' => false, 'error' => 'Ce cours n’est pas publié et n’est pas accessible aux étudiants.'], 403);
}

if ($action === 'enroll') {
    if ($role !== 'student') {
        sendJsonResponse(['success' => false, 'error' => 'Seuls les étudiants peuvent s’inscrire à un cours.'], 403);
    }

    $existing = $pdo->prepare("SELECT id, status FROM enrollments WHERE user_id = :uid AND course_id = :cid LIMIT 1");
    $existing->execute(['uid' => $userId, 'cid' => $courseId]);
    $currentEnrollment = $existing->fetch();
    if ($currentEnrollment) {
        $status = (string)$currentEnrollment['status'];
        sendJsonResponse([
            'success' => false,
            'error' => $status === 'en_cours' ? 'Vous êtes déjà inscrit à ce cours.' : 'Une inscription existe déjà pour ce cours.',
            'status' => $status,
        ], 409);
    }

    $insert = $pdo->prepare("INSERT INTO enrollments (user_id, course_id, status, enrolled_at) VALUES (:uid, :cid, 'en_cours', CURRENT_TIMESTAMP)");
    $insert->execute(['uid' => $userId, 'cid' => $courseId]);

    sendJsonResponse([
        'success' => true,
        'message' => 'Inscription enregistrée avec succès.',
        'enrollment' => [
            'id' => (int)$pdo->lastInsertId(),
            'user_id' => $userId,
            'course_id' => $courseId,
            'status' => 'en_cours',
            'enrolled_at' => date('c'),
        ]
    ]);
}

if ($action === 'cancel' || $action === 'update_status') {
    if ($role === 'student' && $action !== 'cancel') {
        sendJsonResponse(['success' => false, 'error' => 'Un étudiant ne peut pas modifier lui-même le statut de validation d’un cours.'], 403);
    }

    $targetUserId = $role === 'student' ? $userId : (int)($input['user_id'] ?? $userId);

    if ($role === 'teacher' && (int)$course['teacher_id'] !== $userId) {
        sendJsonResponse(['success' => false, 'error' => 'Vous ne pouvez modifier que les inscriptions de vos cours.'], 403);
    }

    $enrollmentStmt = $pdo->prepare("SELECT id, user_id, course_id, status FROM enrollments WHERE user_id = :uid AND course_id = :cid LIMIT 1");
    $enrollmentStmt->execute(['uid' => $targetUserId, 'cid' => $courseId]);
    $enrollment = $enrollmentStmt->fetch();

    if (!$enrollment) {
        sendJsonResponse(['success' => false, 'error' => 'Aucune inscription trouvée pour cet étudiant et ce cours.'], 404);
    }

    $newStatus = $action === 'cancel' ? 'abandonne' : (string)($input['status'] ?? 'termine');
    if (!in_array($newStatus, ['en_cours', 'termine', 'abandonne'], true)) {
        sendJsonResponse(['success' => false, 'error' => 'Statut invalide pour l’inscription.'], 400);
    }

    $completeAt = $newStatus === 'termine' ? 'CURRENT_TIMESTAMP' : 'NULL';
    $stmt = $pdo->prepare("UPDATE enrollments SET status = :status, completed_at = {$completeAt} WHERE id = :id");
    $stmt->execute(['status' => $newStatus, 'id' => (int)$enrollment['id']]);

    sendJsonResponse([
        'success' => true,
        'message' => 'Statut de l’inscription mis à jour.',
        'status' => $newStatus,
        'course_id' => $courseId,
        'user_id' => $targetUserId,
    ]);
}

sendJsonResponse(['success' => false, 'error' => 'Action d’inscription inconnue.'], 400);

<?php
/**
 * LMS Web - Calendrier Universitaire (Événements)
 * Méthode : GET (liste) / POST (ajout)
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth();
$pdo = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $month = $_GET['month'] ?? date('Y-m');

    $visibility = "(ce.user_id = :uid";
    if ($user['role'] === 'student') {
        $visibility .= " OR EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = ce.course_id AND e.user_id = :student_id AND e.status = 'en_cours')";
    } elseif ($user['role'] === 'teacher') {
        $visibility .= " OR EXISTS (SELECT 1 FROM courses tc WHERE tc.id = ce.course_id AND tc.teacher_id = :teacher_id)";
    } else {
        $visibility .= " OR :is_admin = 1";
    }
    $visibility .= ')';

    $stmt = $pdo->prepare("
        SELECT ce.*, c.title AS course_title, c.code AS course_code
        FROM calendar_events ce
        LEFT JOIN courses c ON ce.course_id = c.id
        WHERE ce.event_date LIKE :m AND {$visibility}
        ORDER BY ce.event_date ASC, ce.event_time ASC
    ");
    $params = ['m' => $month . '%', 'uid' => $user['id']];
    if ($user['role'] === 'student') $params['student_id'] = $user['id'];
    if ($user['role'] === 'teacher') $params['teacher_id'] = $user['id'];
    if ($user['role'] === 'admin') $params['is_admin'] = 1;
    $stmt->execute($params);
    $events = $stmt->fetchAll();

    sendJsonResponse([
        'success' => true,
        'events' => $events
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrfToken();
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $title = trim((string)($input['title'] ?? ''));
    $type = (string)($input['event_type'] ?? 'cours');
    $date = trim((string)($input['event_date'] ?? date('Y-m-d')));
    $time = trim((string)($input['event_time'] ?? '10:00'));
    $desc = trim((string)($input['description'] ?? ''));
    $courseId = !empty($input['course_id']) ? (int)$input['course_id'] : null;

    if ($title === '' || strlen($title) > 200 || !in_array($type, ['quiz', 'devoir', 'cours', 'reunion', 'examen'], true)
        || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || !preg_match('/^\d{2}:\d{2}$/', $time)
        || strlen($desc) > 5000) {
        sendJsonResponse(['success' => false, 'error' => 'Titre, type, date, heure ou description invalide.'], 400);
    }

    if ($courseId !== null) {
        $courseStmt = $pdo->prepare('SELECT id, teacher_id FROM courses WHERE id = :course_id LIMIT 1');
        $courseStmt->execute(['course_id' => $courseId]);
        $course = $courseStmt->fetch();
        if (!$course) sendJsonResponse(['success' => false, 'error' => 'Cours introuvable.'], 404);
        if ($user['role'] === 'teacher' && (int)$course['teacher_id'] !== (int)$user['id']) {
            sendJsonResponse(['success' => false, 'error' => 'Ce cours ne vous est pas attribué.'], 403);
        }
        if ($user['role'] === 'student') {
            $enrollment = $pdo->prepare("SELECT 1 FROM enrollments WHERE user_id = :user_id AND course_id = :course_id AND status IN ('en_cours','termine') LIMIT 1");
            $enrollment->execute(['user_id' => (int)$user['id'], 'course_id' => $courseId]);
            if (!$enrollment->fetchColumn()) sendJsonResponse(['success' => false, 'error' => 'Vous n’êtes pas inscrit à ce cours.'], 403);
        }
    }

    $stmt = $pdo->prepare("
        INSERT INTO calendar_events (user_id, course_id, title, event_type, event_date, event_time, description)
        VALUES (:uid, :cid, :title, :type, :edate, :etime, :desc)
    ");
    $stmt->execute([
        'uid' => $user['id'],
        'cid' => $courseId,
        'title' => $title,
        'type' => $type,
        'edate' => $date,
        'etime' => $time,
        'desc' => $desc
    ]);

    sendJsonResponse([
        'success' => true,
        'message' => 'Événement ajouté au calendrier !'
    ]);
}

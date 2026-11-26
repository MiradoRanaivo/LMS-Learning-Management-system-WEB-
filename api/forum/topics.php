<?php
/**
 * LMS Web - Forum Universitaire (Sujets et Détails)
 * Méthode : GET (liste / détail) / POST (création)
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth();
$pdo = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $topicId = !empty($_GET['id']) ? (int)$_GET['id'] : 0;
    
    // Consultation d'un sujet spécifique et de ses réponses
    if ($topicId > 0) {
        $pdo->prepare("UPDATE forum_topics SET views_count = views_count + 1 WHERE id = :id")->execute(['id' => $topicId]);

        $stmt = $pdo->prepare("
            SELECT ft.*, c.title AS course_title, c.code AS course_code,
                   u.firstname, u.lastname, u.role AS author_role, u.avatar_initials
            FROM forum_topics ft
            JOIN courses c ON ft.course_id = c.id
            JOIN users u ON ft.author_id = u.id
            WHERE ft.id = :id
            LIMIT 1
        ");
        $stmt->execute(['id' => $topicId]);
        $topic = $stmt->fetch();

        if (!$topic) {
            sendJsonResponse(['success' => false, 'error' => 'Sujet introuvable.'], 404);
        }

        $repStmt = $pdo->prepare("
            SELECT fr.*, u.firstname, u.lastname, u.role AS author_role, u.avatar_initials
            FROM forum_replies fr
            JOIN users u ON fr.author_id = u.id
            WHERE fr.topic_id = :tid
            ORDER BY fr.is_solution DESC, fr.created_at ASC
        ");
        $repStmt->execute(['tid' => $topicId]);
        $replies = $repStmt->fetchAll();

        sendJsonResponse([
            'success' => true,
            'topic' => $topic,
            'replies' => $replies
        ]);
    }

    // Liste générale des sujets
    $filter = $_GET['filter'] ?? 'all';
    $courseId = !empty($_GET['course_id']) ? (int)$_GET['course_id'] : 0;

    $sql = "
        SELECT ft.*, c.title AS course_title, c.code AS course_code,
               u.firstname, u.lastname, u.role AS author_role, u.avatar_initials,
               (SELECT COUNT(*) FROM forum_replies WHERE topic_id = ft.id) AS replies_count
        FROM forum_topics ft
        JOIN courses c ON ft.course_id = c.id
        JOIN users u ON ft.author_id = u.id
        WHERE 1=1
    ";
    $params = [];

    if ($courseId > 0) {
        $sql .= " AND ft.course_id = :cid";
        $params['cid'] = $courseId;
    }
    if ($filter === 'resolved') {
        $sql .= " AND ft.is_resolved = 1";
    } elseif ($filter === 'unresolved') {
        $sql .= " AND ft.is_resolved = 0";
    }

    if ($user['role'] === 'student') {
        $sql .= " AND EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = ft.course_id AND e.user_id = :student_id AND e.status = 'en_cours')";
        $params['student_id'] = $user['id'];
    } elseif ($user['role'] === 'teacher') {
        $sql .= " AND EXISTS (SELECT 1 FROM courses tc WHERE tc.id = ft.course_id AND tc.teacher_id = :teacher_id)";
        $params['teacher_id'] = $user['id'];
    }

    $sql .= " ORDER BY ft.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $topics = $stmt->fetchAll();

    sendJsonResponse([
        'success' => true,
        'topics' => $topics
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrfToken();
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $courseId = (int)($input['course_id'] ?? 0);
    $title = trim((string)($input['title'] ?? ''));
    $content = trim((string)($input['content'] ?? ''));

    if ($courseId <= 0 || $title === '' || mb_strlen($title) > 255 || $content === '' || mb_strlen($content) > 65535) {
        sendJsonResponse(['success' => false, 'error' => 'Cours, titre ou message invalide.'], 400);
    }

    if ($user['role'] === 'student') {
        $access = $pdo->prepare("SELECT 1 FROM enrollments WHERE user_id = :uid AND course_id = :cid AND status = 'en_cours' LIMIT 1");
        $access->execute(['uid' => $user['id'], 'cid' => $courseId]);
        if (!$access->fetchColumn()) {
            sendJsonResponse(['success' => false, 'error' => 'Vous devez être inscrit à ce cours pour publier une question.'], 403);
        }
    } elseif ($user['role'] === 'teacher') {
        $access = $pdo->prepare('SELECT 1 FROM courses WHERE id = :cid AND teacher_id = :uid LIMIT 1');
        $access->execute(['uid' => $user['id'], 'cid' => $courseId]);
        if (!$access->fetchColumn()) {
            sendJsonResponse(['success' => false, 'error' => 'Vous ne pouvez publier que dans vos cours.'], 403);
        }
    }

    $stmt = $pdo->prepare("
        INSERT INTO forum_topics (course_id, author_id, title, content, is_resolved, created_at)
        VALUES (:cid, :uid, :title, :content, 0, CURRENT_TIMESTAMP)
    ");
    $stmt->execute([
        'cid' => $courseId,
        'uid' => $user['id'],
        'title' => $title,
        'content' => $content
    ]);

    sendJsonResponse([
        'success' => true,
        'message' => 'Sujet publié avec succès sur le forum !'
    ]);
}

header('Allow: GET, POST');
sendJsonResponse(['success' => false, 'error' => 'Méthode non autorisée.'], 405);

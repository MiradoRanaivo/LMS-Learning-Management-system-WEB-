<?php
/** Gestion et consultation sécurisée des leçons. */
declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth();
$pdo = getDB();
$role = (string)$user['role'];
$userId = (int)$user['id'];

$lessonQuery = 'SELECT l.*, ch.course_id, c.teacher_id, c.is_published AS course_published FROM lessons l JOIN chapters ch ON ch.id = l.chapter_id JOIN courses c ON c.id = ch.course_id';
$authorizeLesson = static function (array $lesson) use ($pdo, $role, $userId): void {
    if ($role === 'teacher' && (int)$lesson['teacher_id'] !== $userId) {
        sendJsonResponse(['success' => false, 'error' => 'Cette leçon ne vous est pas attribuée.'], 403);
    }
    if ($role === 'student') {
        $enrollment = $pdo->prepare("SELECT 1 FROM enrollments WHERE user_id = :uid AND course_id = :cid AND status IN ('en_cours', 'termine') LIMIT 1");
        $enrollment->execute(['uid' => $userId, 'cid' => (int)$lesson['course_id']]);
        if (!$enrollment->fetchColumn() || (int)$lesson['is_published'] !== 1 || (int)$lesson['course_published'] !== 1) {
            sendJsonResponse(['success' => false, 'error' => 'Leçon inaccessible.'], 403);
        }
    }
};

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id > 0) {
        $stmt = $pdo->prepare($lessonQuery . ' WHERE l.id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $lesson = $stmt->fetch();
        if (!$lesson) sendJsonResponse(['success' => false, 'error' => 'Leçon introuvable.'], 404);
        $authorizeLesson($lesson);
        unset($lesson['teacher_id'], $lesson['course_published']);
        sendJsonResponse(['success' => true, 'lesson' => $lesson, 'csrf_token' => getCsrfToken()]);
    }
    $chapterId = (int)($_GET['chapter_id'] ?? 0);
    $chapter = $pdo->prepare('SELECT ch.id, ch.course_id, c.teacher_id, c.is_published FROM chapters ch JOIN courses c ON c.id = ch.course_id WHERE ch.id = :id');
    $chapter->execute(['id' => $chapterId]);
    $chapterInfo = $chapter->fetch();
    if (!$chapterInfo) sendJsonResponse(['success' => false, 'error' => 'Section introuvable.'], 404);
    if ($role === 'teacher' && (int)$chapterInfo['teacher_id'] !== $userId) sendJsonResponse(['success' => false, 'error' => 'Cette section ne vous est pas attribuée.'], 403);
    $where = ' WHERE chapter_id = :chapter_id';
    $params = ['chapter_id' => $chapterId];
    if ($role === 'student') {
        $enrollment = $pdo->prepare("SELECT 1 FROM enrollments WHERE user_id = :uid AND course_id = :cid AND status IN ('en_cours', 'termine') LIMIT 1");
        $enrollment->execute(['uid' => $userId, 'cid' => (int)$chapterInfo['course_id']]);
        if (!$enrollment->fetchColumn() || (int)$chapterInfo['is_published'] !== 1) sendJsonResponse(['success' => false, 'error' => 'Section inaccessible.'], 403);
        $where .= ' AND is_published = 1';
    }
    $stmt = $pdo->prepare('SELECT id, chapter_id, order_num, title, summary, duration_minutes, is_published FROM lessons' . $where . ' ORDER BY order_num, id');
    $stmt->execute($params);
    sendJsonResponse(['success' => true, 'lessons' => $stmt->fetchAll(), 'csrf_token' => getCsrfToken()]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: GET, POST');
    sendJsonResponse(['success' => false, 'error' => 'Méthode non autorisée.'], 405);
}
verifyCsrfToken();
if (!in_array($role, ['teacher', 'admin'], true)) sendJsonResponse(['success' => false, 'error' => 'Action réservée aux enseignants.'], 403);
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) $input = $_POST;
$action = (string)($input['action'] ?? 'create');

if ($action === 'create' || $action === 'update') {
    $id = (int)($input['id'] ?? 0);
    $chapterId = (int)($input['chapter_id'] ?? 0);
    $chapter = $pdo->prepare('SELECT ch.id, c.teacher_id FROM chapters ch JOIN courses c ON c.id = ch.course_id WHERE ch.id = :id');
    $chapter->execute(['id' => $chapterId]);
    $chapterInfo = $chapter->fetch();
    if (!$chapterInfo) sendJsonResponse(['success' => false, 'error' => 'Section introuvable.'], 404);
    if ($role === 'teacher' && (int)$chapterInfo['teacher_id'] !== $userId) sendJsonResponse(['success' => false, 'error' => 'Cette section ne vous est pas attribuée.'], 403);
    $title = trim((string)($input['title'] ?? ''));
    $summary = trim((string)($input['summary'] ?? ''));
    $content = trim((string)($input['content'] ?? ''));
    $duration = (int)($input['duration_minutes'] ?? 20);
    $order = max(1, (int)($input['order_num'] ?? 1));
    $published = !empty($input['is_published']) ? 1 : 0;
    if ($title === '' || mb_strlen($title) > 200 || mb_strlen($summary) > 255 || $content === '' || strlen($content) > 1000000 || $duration < 1 || $duration > 1440) {
        sendJsonResponse(['success' => false, 'error' => 'Titre, contenu, résumé ou durée invalide.'], 400);
    }
    if ($action === 'create') {
        $stmt = $pdo->prepare('INSERT INTO lessons (chapter_id, order_num, title, summary, content, duration_minutes, is_published) VALUES (:chapter_id, :order_num, :title, :summary, :content, :duration, :published)');
        $stmt->execute(['chapter_id' => $chapterId, 'order_num' => $order, 'title' => $title, 'summary' => $summary !== '' ? $summary : null, 'content' => $content, 'duration' => $duration, 'published' => $published]);
        sendJsonResponse(['success' => true, 'lesson_id' => (int)$pdo->lastInsertId()], 201);
    }
    $current = $pdo->prepare($lessonQuery . ' WHERE l.id = :id LIMIT 1');
    $current->execute(['id' => $id]);
    $currentLesson = $current->fetch();
    if (!$currentLesson) sendJsonResponse(['success' => false, 'error' => 'Leçon introuvable.'], 404);
    $authorizeLesson($currentLesson);
    $stmt = $pdo->prepare('UPDATE lessons SET chapter_id = :chapter_id, order_num = :order_num, title = :title, summary = :summary, content = :content, duration_minutes = :duration WHERE id = :id');
    $stmt->execute(['chapter_id' => $chapterId, 'order_num' => $order, 'title' => $title, 'summary' => $summary !== '' ? $summary : null, 'content' => $content, 'duration' => $duration, 'id' => $id]);
    sendJsonResponse(['success' => true, 'message' => 'Leçon mise à jour.']);
}

if ($action === 'reorder') {
    $chapterId = (int)($input['chapter_id'] ?? 0);
    $ids = $input['lesson_ids'] ?? null;
    if (!is_array($ids) || count($ids) > 1000) sendJsonResponse(['success' => false, 'error' => 'Ordre des leçons invalide.'], 400);
    $chapter = $pdo->prepare('SELECT ch.id, c.teacher_id FROM chapters ch JOIN courses c ON c.id = ch.course_id WHERE ch.id = :id');
    $chapter->execute(['id' => $chapterId]);
    $chapterInfo = $chapter->fetch();
    if (!$chapterInfo) sendJsonResponse(['success' => false, 'error' => 'Section introuvable.'], 404);
    if ($role === 'teacher' && (int)$chapterInfo['teacher_id'] !== $userId) sendJsonResponse(['success' => false, 'error' => 'Cette section ne vous est pas attribuée.'], 403);
    $ids = array_map('intval', array_values($ids));
    if (count($ids) !== count(array_unique($ids))) sendJsonResponse(['success' => false, 'error' => 'Une leçon ne peut apparaître qu’une fois dans l’ordre.'], 400);
    $count = $pdo->prepare('SELECT COUNT(*) FROM lessons WHERE chapter_id = :chapter_id');
    $count->execute(['chapter_id' => $chapterId]);
    if (count($ids) !== (int)$count->fetchColumn()) sendJsonResponse(['success' => false, 'error' => 'La liste doit contenir toutes les leçons de la section.'], 400);
    $pdo->beginTransaction();
    try {
        $check = $pdo->prepare('SELECT COUNT(*) FROM lessons WHERE id = :id AND chapter_id = :chapter_id');
        $update = $pdo->prepare('UPDATE lessons SET order_num = :order_num WHERE id = :id AND chapter_id = :chapter_id');
        foreach ($ids as $index => $lessonId) {
            $check->execute(['id' => $lessonId, 'chapter_id' => $chapterId]);
            if (!$check->fetchColumn()) throw new RuntimeException('Leçon invalide dans le nouvel ordre.');
            $update->execute(['order_num' => $index + 1, 'id' => $lessonId, 'chapter_id' => $chapterId]);
        }
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        sendJsonResponse(['success' => false, 'error' => $error->getMessage()], 400);
    }
    sendJsonResponse(['success' => true]);
}

$id = (int)($input['id'] ?? 0);
$stmt = $pdo->prepare($lessonQuery . ' WHERE l.id = :id LIMIT 1');
$stmt->execute(['id' => $id]);
$lesson = $stmt->fetch();
if (!$lesson) sendJsonResponse(['success' => false, 'error' => 'Leçon introuvable.'], 404);
$authorizeLesson($lesson);

if ($action === 'publish') {
    $update = $pdo->prepare('UPDATE lessons SET is_published = :published WHERE id = :id');
    $update->execute(['published' => !empty($input['is_published']) ? 1 : 0, 'id' => $id]);
    sendJsonResponse(['success' => true]);
}
if ($action === 'delete') {
    $progress = $pdo->prepare('SELECT COUNT(*) FROM lesson_progress WHERE lesson_id = :id');
    $progress->execute(['id' => $id]);
    if ((int)$progress->fetchColumn() > 0) sendJsonResponse(['success' => false, 'error' => 'Cette leçon possède des progressions étudiantes et ne peut pas être supprimée.'], 409);
    $pdo->prepare('DELETE FROM lessons WHERE id = :id')->execute(['id' => $id]);
    sendJsonResponse(['success' => true]);
}
sendJsonResponse(['success' => false, 'error' => 'Action inconnue.'], 400);
<?php
/**
 * LMS Web - Gestion du catalogue des cours et catégories
 * Méthodes : GET / POST / DELETE
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth();
$pdo = getDB();

function normalizeSlug(string $value): string {
    $slug = strtolower(trim($value));
    $slug = preg_replace('/[^a-z0-9]+/i', '-', $slug) ?? '';
    $slug = trim((string)$slug, '-');
    return $slug;
}

function validateCourseInput(array $input): array {
    $code = strtoupper(trim((string)($input['code'] ?? '')));
    $title = trim((string)($input['title'] ?? ''));
    $description = trim((string)($input['description'] ?? ''));
    $level = (string)($input['level'] ?? 'Débutant');
    $hours = max(1, (int)($input['hours_total'] ?? 12));
    $credits = max(1, (int)($input['credits_ects'] ?? 4));
    $semester = trim((string)($input['semester'] ?? 'S1'));
    $categoryId = isset($input['category_id']) && $input['category_id'] !== '' ? (int)$input['category_id'] : null;

    if ($categoryId !== null) {
        $pdo = getDB();
        $categoryCheck = $pdo->prepare('SELECT id FROM categories WHERE id = :id LIMIT 1');
        $categoryCheck->execute(['id' => $categoryId]);
        if (!$categoryCheck->fetchColumn()) {
            sendJsonResponse(['success' => false, 'error' => 'Catégorie introuvable.'], 400);
        }
    }

    if ($code === '' || $title === '' || $description === '') {
        sendJsonResponse(['success' => false, 'error' => 'Code, titre et description sont obligatoires.'], 400);
    }
    if (!in_array($level, ['Débutant', 'Intermédiaire', 'Avancé'], true)) {
        sendJsonResponse(['success' => false, 'error' => 'Niveau invalide.'], 400);
    }
    if ($semester === '' || strlen($semester) > 10) {
        sendJsonResponse(['success' => false, 'error' => 'Semestre invalide.'], 400);
    }

    return [
        'code' => $code,
        'title' => $title,
        'description' => $description,
        'category_id' => $categoryId,
        'level' => $level,
        'hours_total' => $hours,
        'credits_ects' => $credits,
        'semester' => $semester,
    ];
}

$userId = (int)$user['id'];
$role = $user['role'];
$statusFilter = $_GET['status'] ?? 'all'; // 'en_cours', 'termine', 'all'
$scope = strtolower((string)($_GET['scope'] ?? 'enrolled'));

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    verifyCsrfToken();
    $courseId = (int)($_GET['id'] ?? 0);
    if ($courseId <= 0) {
        sendJsonResponse(['success' => false, 'error' => 'Identifiant de cours invalide.'], 400);
    }
    if (!in_array($role, ['teacher', 'admin'], true)) {
        sendJsonResponse(['success' => false, 'error' => 'Accès refusé.'], 403);
    }

    $courseStmt = $pdo->prepare('SELECT id, teacher_id FROM courses WHERE id = :id LIMIT 1');
    $courseStmt->execute(['id' => $courseId]);
    $course = $courseStmt->fetch();
    if (!$course) {
        sendJsonResponse(['success' => false, 'error' => 'Cours introuvable.'], 404);
    }
    if ($role === 'teacher' && (int)$course['teacher_id'] !== $userId) {
        sendJsonResponse(['success' => false, 'error' => 'Vous ne pouvez pas supprimer un cours qui ne vous appartient pas.'], 403);
    }

    $enrollmentCheck = $pdo->prepare('SELECT COUNT(*) FROM enrollments WHERE course_id = :id LIMIT 1');
    $enrollmentCheck->execute(['id' => $courseId]);
    if ((int)$enrollmentCheck->fetchColumn() > 0 && $role !== 'admin') {
        $pdo->prepare('UPDATE courses SET is_published = 0 WHERE id = :id')->execute(['id' => $courseId]);
        sendJsonResponse(['success' => true, 'message' => 'Le cours a été archivé. Il reste conservé dans l’historique sans être supprimé du catalogue actif.']);
    }

    $pdo->prepare('DELETE FROM courses WHERE id = :id')->execute(['id' => $courseId]);
    sendJsonResponse(['success' => true, 'message' => 'Cours supprimé.']);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrfToken();
    if (!in_array($role, ['teacher', 'admin'], true)) {
        sendJsonResponse(['success' => false, 'error' => 'Seuls les enseignants et administrateurs peuvent créer un cours.'], 403);
    }

    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $action = strtolower((string)($input['action'] ?? 'create'));
    $validated = validateCourseInput($input);
    $code = $validated['code'];
    $title = $validated['title'];
    $description = $validated['description'];
    $level = $validated['level'];
    $hours = $validated['hours_total'];
    $credits = $validated['credits_ects'];
    $semester = $validated['semester'];
    $teacherId = $userId;

    if ($role === 'admin' && !empty($input['teacher_id'])) {
        $teacherId = (int)$input['teacher_id'];
    }

    if ($action === 'update') {
        $courseId = (int)($input['id'] ?? 0);
        if ($courseId <= 0) {
            sendJsonResponse(['success' => false, 'error' => 'Identifiant de cours invalide.'], 400);
        }
        $courseStmt = $pdo->prepare('SELECT id, teacher_id FROM courses WHERE id = :id LIMIT 1');
        $courseStmt->execute(['id' => $courseId]);
        $course = $courseStmt->fetch();
        if (!$course) {
            sendJsonResponse(['success' => false, 'error' => 'Cours introuvable.'], 404);
        }
        if ($role === 'teacher' && (int)$course['teacher_id'] !== $userId) {
            sendJsonResponse(['success' => false, 'error' => 'Vous ne pouvez pas modifier un cours qui ne vous appartient pas.'], 403);
        }

        $isPublished = isset($input['is_published']) ? (int)$input['is_published'] : 1;
        $stmt = $pdo->prepare('UPDATE courses SET code = :code, title = :title, description = :description, category_id = :category_id, teacher_id = :teacher_id, level = :level, hours_total = :hours, credits_ects = :credits, semester = :semester, is_published = :is_published WHERE id = :id');
        $stmt->execute([
            'code' => $code,
            'title' => $title,
            'description' => $description,
            'category_id' => isset($validated['category_id']) && $validated['category_id'] !== null ? (int)$validated['category_id'] : null,
            'teacher_id' => $teacherId,
            'level' => $level,
            'hours' => $hours,
            'credits' => $credits,
            'semester' => $semester,
            'is_published' => $isPublished,
            'id' => $courseId,
        ]);
        sendJsonResponse(['success' => true, 'message' => 'Cours mis à jour.', 'course_id' => $courseId]);
    }

    if (in_array($action, ['delete', 'archive'], true)) {
        $courseId = (int)($input['id'] ?? 0);
        if ($courseId <= 0) {
            sendJsonResponse(['success' => false, 'error' => 'Identifiant de cours invalide.'], 400);
        }
        $courseStmt = $pdo->prepare('SELECT id, teacher_id FROM courses WHERE id = :id LIMIT 1');
        $courseStmt->execute(['id' => $courseId]);
        $course = $courseStmt->fetch();
        if (!$course) {
            sendJsonResponse(['success' => false, 'error' => 'Cours introuvable.'], 404);
        }
        if ($role === 'teacher' && (int)$course['teacher_id'] !== $userId) {
            sendJsonResponse(['success' => false, 'error' => 'Vous ne pouvez pas archiver un cours qui ne vous appartient pas.'], 403);
        }

        if ($action === 'archive') {
            $pdo->prepare('UPDATE courses SET is_published = 0 WHERE id = :id')->execute(['id' => $courseId]);
            sendJsonResponse(['success' => true, 'message' => 'Cours archivé.']);
        }

        $pdo->prepare('DELETE FROM courses WHERE id = :id')->execute(['id' => $courseId]);
        sendJsonResponse(['success' => true, 'message' => 'Cours supprimé.']);
    }

    $teacherCheck = $pdo->prepare("SELECT id FROM users WHERE id = :id AND role = 'teacher' LIMIT 1");
    $teacherCheck->execute(['id' => $teacherId]);
    if (!$teacherCheck->fetchColumn()) {
        sendJsonResponse(['success' => false, 'error' => 'Enseignant responsable introuvable.'], 400);
    }

    try {
        $insert = $pdo->prepare('INSERT INTO courses (code, title, description, category_id, teacher_id, level, hours_total, credits_ects, semester, is_published) VALUES (:code, :title, :description, :category_id, :teacher_id, :level, :hours, :credits, :semester, 1)');
        $insert->execute(['code' => $code, 'title' => $title, 'description' => $description, 'category_id' => $validated['category_id'], 'teacher_id' => $teacherId, 'level' => $level, 'hours' => $hours, 'credits' => $credits, 'semester' => $semester]);
        sendJsonResponse(['success' => true, 'message' => 'Cours créé.', 'course_id' => (int)$pdo->lastInsertId()], 201);
    } catch (PDOException $error) {
        sendJsonResponse(['success' => false, 'error' => 'Code de cours déjà utilisé ou données invalides.'], 409);
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJsonResponse(['success' => false, 'error' => 'Méthode non autorisée.'], 405);
}

$sql = "
    SELECT 
        c.id,
        c.code,
        c.title,
        c.description,
        c.category_id,
        c.teacher_id,
        c.level,
        c.hours_total,
        c.credits_ects,
        c.color_accent,
        cat.name AS category_name,
        cat.slug AS category_slug,
        u.firstname AS teacher_firstname,
        u.lastname AS teacher_lastname,
        (SELECT COUNT(*) FROM chapters WHERE course_id = c.id) AS total_chapters,
            (SELECT COUNT(*) FROM lessons l JOIN chapters ch ON l.chapter_id = ch.id WHERE ch.course_id = c.id AND l.is_published = 1) AS total_lessons,
        (
            SELECT COUNT(*) 
            FROM lesson_progress lp 
            JOIN lessons l ON lp.lesson_id = l.id 
            JOIN chapters ch ON l.chapter_id = ch.id 
            WHERE ch.course_id = c.id AND lp.user_id = :uid AND lp.is_completed = 1 AND l.is_published = 1
        ) AS completed_lessons,
        e.status AS enrollment_status
    FROM courses c
    LEFT JOIN categories cat ON cat.id = c.category_id
    JOIN users u ON c.teacher_id = u.id
    LEFT JOIN enrollments e ON c.id = e.course_id AND e.user_id = :uid2
    WHERE c.is_published = 1
    ORDER BY c.id ASC
";

if ($role === 'teacher') {
    $sql = str_replace('WHERE c.is_published = 1', 'WHERE c.is_published = 1 AND c.teacher_id = :teacher_id', $sql);
} elseif ($role === 'student' && $scope === 'followed') {
    $sql = str_replace(
        'WHERE c.is_published = 1',
        'WHERE c.is_published = 1 AND EXISTS (SELECT 1 FROM teacher_follows tf_follow WHERE tf_follow.teacher_id = c.teacher_id AND tf_follow.student_id = :follow_student_id)',
        $sql
    );
} elseif ($role === 'student' && $scope !== 'catalog') {
    $sql = str_replace('WHERE c.is_published = 1', 'WHERE c.is_published = 1 AND e.user_id IS NOT NULL', $sql);
}

$stmt = $pdo->prepare($sql);
$params = ['uid' => $userId, 'uid2' => $userId];
if ($role === 'teacher') {
    $params['teacher_id'] = $userId;
} elseif ($role === 'student' && $scope === 'followed') {
    $params['follow_student_id'] = $userId;
}
$stmt->execute($params);
$courses = $stmt->fetchAll();

foreach ($courses as &$course) {
    $total = (int)$course['total_lessons'];
    $completed = (int)$course['completed_lessons'];
    $course['progress_percent'] = ($total > 0) ? round(($completed / $total) * 100) : 0;
    $course['category_name'] = $course['category_name'] ?? 'Sans catégorie';
    $course['category_slug'] = $course['category_slug'] ?? null;
    
}
unset($course);

if (in_array($statusFilter, ['en_cours', 'termine'], true)) {
    $courses = array_values(array_filter($courses, static function (array $course) use ($statusFilter): bool {
        if ($statusFilter === 'en_cours') {
            return $course['enrollment_status'] === 'en_cours';
        }
        return $course['enrollment_status'] === 'termine';
    }));
}

sendJsonResponse([
    'success' => true,
    'courses' => $courses
]);

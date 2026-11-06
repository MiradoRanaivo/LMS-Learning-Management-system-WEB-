<?php
declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    sendJsonResponse(['success' => false, 'error' => 'Méthode GET requise.'], 405);
}
$pdo = getDB();
$userId = (int)$user['id'];
$role = (string)$user['role'];

if (in_array($role, ['teacher', 'admin'], true)) {
    $where = $role === 'teacher' ? 'WHERE c.teacher_id = :teacher_id' : '';
    $courseWhere = $role === 'teacher' ? 'WHERE teacher_id = :teacher_id' : '';
    $coursesStmt = $pdo->prepare("SELECT id, code, title FROM courses {$courseWhere} ORDER BY title ASC");
    $coursesStmt->execute($role === 'teacher' ? ['teacher_id' => $userId] : []);
    $courses = $coursesStmt->fetchAll();
    $stmt = $pdo->prepare("SELECT a.id, a.course_id, a.title, a.description, a.instructions, a.publication_date, a.due_date, a.max_grade, a.is_published, a.archived_at, a.attachment_name, a.created_at, c.title AS course_title, c.code AS course_code,
        (SELECT COUNT(*) FROM assignment_submissions s WHERE s.assignment_id = a.id) AS submissions_count,
        (SELECT COUNT(*) FROM assignment_submissions s WHERE s.assignment_id = a.id AND s.status IN ('rendu', 'en_retard')) AS pending_count
        FROM assignments a JOIN courses c ON c.id = a.course_id {$where} ORDER BY a.due_date ASC");
    $stmt->execute($role === 'teacher' ? ['teacher_id' => $userId] : []);
    $assignments = $stmt->fetchAll();

    $submissionWhere = $role === 'teacher' ? 'AND c.teacher_id = :teacher_id' : '';
    $subStmt = $pdo->prepare("SELECT s.id, a.id AS assignment_id, e.user_id, s.original_file_name, s.student_comment, s.grade_value, s.teacher_feedback, s.grade_published, s.status, s.submitted_at, s.graded_at, u.firstname, u.lastname, u.email, u.avatar_initials, a.title AS assignment_title, a.max_grade
        FROM assignments a JOIN courses c ON c.id = a.course_id
        JOIN enrollments e ON e.course_id = a.course_id AND e.status IN ('en_cours', 'termine')
        JOIN users u ON u.id = e.user_id
        LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.user_id = e.user_id
        WHERE 1 = 1 {$submissionWhere}
        ORDER BY s.submitted_at DESC, u.lastname, u.firstname");
    $subStmt->execute($role === 'teacher' ? ['teacher_id' => $userId] : []);

    sendJsonResponse([
        'success' => true,
        'role' => $role,
        'courses' => $courses,
        'assignments' => $assignments,
        'submissions' => $subStmt->fetchAll(),
        'csrf_token' => getCsrfToken(),
    ]);
}

if ($role !== 'student') sendJsonResponse(['success' => false, 'error' => 'Accès refusé.'], 403);
$stmt = $pdo->prepare("SELECT a.id, a.course_id, a.title, a.description, a.instructions, a.publication_date, a.due_date, a.max_grade, a.attachment_name, c.title AS course_title, c.code AS course_code,
        s.id AS submission_id, s.original_file_name, s.student_comment,
        CASE WHEN s.status = 'corrige' AND s.grade_published = 1 THEN s.grade_value ELSE NULL END AS grade_value,
        CASE WHEN s.status = 'corrige' AND s.grade_published = 1 THEN s.teacher_feedback ELSE NULL END AS teacher_feedback,
        CASE WHEN s.id IS NULL THEN 'non_rendu' WHEN s.status <> 'corrige' THEN 'en_attente_correction' WHEN s.grade_published = 1 THEN 'publie' ELSE 'corrige_non_publie' END AS grade_visibility,
        s.grade_published,
        CASE WHEN s.id IS NULL AND a.due_date < CURRENT_TIMESTAMP THEN 'en_retard' WHEN s.id IS NULL THEN 'non_rendu' ELSE s.status END AS submission_status,
        s.submitted_at, s.graded_at
    FROM assignments a JOIN courses c ON c.id = a.course_id
    JOIN enrollments e ON e.course_id = a.course_id AND e.user_id = :enrollment_user AND e.status IN ('en_cours', 'termine')
    LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.user_id = :submission_user
    WHERE a.is_published = 1 AND a.archived_at IS NULL AND (a.publication_date IS NULL OR a.publication_date <= CURRENT_TIMESTAMP) AND c.is_published = 1
    ORDER BY a.due_date ASC");
$stmt->execute(['enrollment_user' => $userId, 'submission_user' => $userId]);
sendJsonResponse([
    'success' => true,
    'role' => 'student',
    'assignments' => $stmt->fetchAll(),
    'csrf_token' => getCsrfToken(),
]);

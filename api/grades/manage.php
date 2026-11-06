<?php
/**
 * Teacher coursebook and course-grade management.
 * GET /api/grades/manage.php?course_id=123
 * POST {action: save_course_grade, ...}
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth(['teacher', 'admin']);
$pdo = getDB();
$userId = (int)$user['id'];
$isTeacher = $user['role'] === 'teacher';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $courseId = (int)($_GET['course_id'] ?? 0);
    $courseSql = 'SELECT id, code, title, teacher_id, credits_ects FROM courses';
    $courseParams = [];
    if ($isTeacher) {
        $courseSql .= ' WHERE teacher_id = :teacher_id';
        $courseParams['teacher_id'] = $userId;
        if ($courseId > 0) $courseSql .= ' AND id = :course_id';
    } elseif ($courseId > 0) {
        $courseSql .= ' WHERE id = :course_id';
    }
    if ($courseId > 0) $courseParams['course_id'] = $courseId;
    $courseSql .= ' ORDER BY title';
    $courseStmt = $pdo->prepare($courseSql);
    $courseStmt->execute($courseParams);
    $courses = $courseStmt->fetchAll();
    if ($courseId > 0 && !$courses) sendJsonResponse(['success' => false, 'error' => 'Cours introuvable ou non attribué.'], 404);

    $courseGrades = [];
    $assignments = [];
    $quizAttempts = [];
    if ($courseId > 0) {
        $studentsStmt = $pdo->prepare("SELECT u.id AS user_id, u.firstname, u.lastname, u.email, e.status AS enrollment_status, g.id AS grade_id, g.cc_grade, g.exam_grade, CASE WHEN g.id IS NULL THEN NULL ELSE ROUND(g.cc_grade * 0.40 + g.exam_grade * 0.60, 2) END AS final_grade, g.coefficient, g.credits_earned, g.status AS grade_status, g.is_published, g.teacher_comment FROM enrollments e JOIN users u ON u.id = e.user_id LEFT JOIN grades g ON g.user_id = e.user_id AND g.course_id = e.course_id WHERE e.course_id = :course_id AND e.status IN ('en_cours','termine') ORDER BY u.lastname,u.firstname");
        $studentsStmt->execute(['course_id' => $courseId]);
        $courseGrades = $studentsStmt->fetchAll();

        $assignmentStmt = $pdo->prepare("SELECT a.id AS assignment_id, a.title AS assignment_title, a.max_grade, s.id AS submission_id, s.user_id, s.grade_value, s.teacher_feedback, s.status AS correction_status, s.grade_published, s.submitted_at, u.firstname, u.lastname, u.email FROM assignments a JOIN enrollments e ON e.course_id = a.course_id AND e.status IN ('en_cours','termine') JOIN users u ON u.id = e.user_id LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.user_id = e.user_id WHERE a.course_id = :course_id ORDER BY a.created_at DESC,u.lastname,u.firstname");
        $assignmentStmt->execute(['course_id' => $courseId]);
        $assignments = $assignmentStmt->fetchAll();

        $quizStmt = $pdo->prepare("SELECT a.id AS attempt_id, a.user_id, a.quiz_id, a.score, a.total_questions, a.percentage, a.passed, a.status, a.manual_review, a.result_published, a.attempted_at, q.title AS quiz_title, q.assessment_type, u.firstname, u.lastname, u.email, (SELECT COALESCE(SUM(GREATEST(qq.points,1)),0) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS max_score FROM quiz_attempts a JOIN quizzes q ON q.id = a.quiz_id JOIN users u ON u.id = a.user_id WHERE q.course_id = :course_id ORDER BY a.attempted_at DESC");
        $quizStmt->execute(['course_id' => $courseId]);
        $quizAttempts = $quizStmt->fetchAll();
    }

    sendJsonResponse([
        'success' => true,
        'courses' => $courses,
        'course_grades' => $courseGrades,
        'assignment_results' => $assignments,
        'quiz_results' => $quizAttempts,
        'csrf_token' => getCsrfToken(),
    ]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'error' => 'Méthode GET ou POST requise.'], 405);
}
verifyCsrfToken();
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
if (strtolower((string)($input['action'] ?? '')) !== 'save_course_grade') {
    sendJsonResponse(['success' => false, 'error' => 'Action de note inconnue.'], 400);
}
$courseId = (int)($input['course_id'] ?? 0);
$studentId = (int)($input['user_id'] ?? 0);
$cc = filter_var($input['cc_grade'] ?? null, FILTER_VALIDATE_FLOAT);
$exam = filter_var($input['exam_grade'] ?? null, FILTER_VALIDATE_FLOAT);
$coefficient = filter_var($input['coefficient'] ?? null, FILTER_VALIDATE_FLOAT);
$comment = trim((string)($input['teacher_comment'] ?? ''));
if ($courseId <= 0 || $studentId <= 0 || $cc === false || $exam === false || $coefficient === false || $cc < 0 || $cc > 20 || $exam < 0 || $exam > 20 || $coefficient < 0 || $coefficient > 99.9 || strlen($comment) > 5000) {
    sendJsonResponse(['success' => false, 'error' => 'Cours, étudiant, notes, coefficient ou commentaire invalide.'], 400);
}
$courseStmt = $pdo->prepare('SELECT id, teacher_id, credits_ects FROM courses WHERE id = :course_id LIMIT 1');
$courseStmt->execute(['course_id' => $courseId]);
$course = $courseStmt->fetch();
if (!$course) sendJsonResponse(['success' => false, 'error' => 'Cours introuvable.'], 404);
if ($isTeacher && (int)$course['teacher_id'] !== $userId) sendJsonResponse(['success' => false, 'error' => 'Ce cours ne vous est pas attribué.'], 403);
$enrollment = $pdo->prepare("SELECT 1 FROM enrollments WHERE course_id = :course_id AND user_id = :user_id AND status IN ('en_cours','termine') LIMIT 1");
$enrollment->execute(['course_id' => $courseId, 'user_id' => $studentId]);
if (!$enrollment->fetchColumn()) sendJsonResponse(['success' => false, 'error' => 'L’étudiant n’est pas inscrit à ce cours.'], 404);

$final = round(((float)$cc * 0.40) + ((float)$exam * 0.60), 2);
$status = $final >= 10 ? 'Validé' : 'Rattrapage';
$credits = $final >= 10 ? (int)$course['credits_ects'] : 0;
$save = $pdo->prepare("INSERT INTO grades (user_id, course_id, cc_grade, exam_grade, final_grade, coefficient, credits_earned, status, is_published, teacher_comment) VALUES (:user_id, :course_id, :cc_grade, :exam_grade, :final_grade, :coefficient, :credits, :status, 0, :teacher_comment) ON DUPLICATE KEY UPDATE cc_grade = VALUES(cc_grade), exam_grade = VALUES(exam_grade), final_grade = VALUES(final_grade), coefficient = VALUES(coefficient), credits_earned = VALUES(credits_earned), status = VALUES(status), teacher_comment = VALUES(teacher_comment), is_published = 0");
$save->execute([
    'user_id' => $studentId,
    'course_id' => $courseId,
    'cc_grade' => number_format((float)$cc, 2, '.', ''),
    'exam_grade' => number_format((float)$exam, 2, '.', ''),
    'final_grade' => number_format($final, 2, '.', ''),
    'coefficient' => number_format((float)$coefficient, 1, '.', ''),
    'credits' => $credits,
    'status' => $status,
    'teacher_comment' => $comment === '' ? null : $comment,
]);
$gradeIdStmt = $pdo->prepare('SELECT id FROM grades WHERE user_id = :user_id AND course_id = :course_id LIMIT 1');
$gradeIdStmt->execute(['user_id' => $studentId, 'course_id' => $courseId]);
sendJsonResponse(['success' => true, 'grade_id' => (int)$gradeIdStmt->fetchColumn(), 'cc_grade' => (float)$cc, 'exam_grade' => (float)$exam, 'final_grade' => $final, 'coefficient' => (float)$coefficient, 'is_published' => false]);

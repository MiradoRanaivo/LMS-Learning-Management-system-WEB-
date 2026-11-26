<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';

$user = checkAuth();
$pdo = getDB();
$userId = (int)$user['id'];
$role = (string)$user['role'];

try {
    if ($role === 'student') {
        $stmt = $pdo->prepare("SELECT
            (SELECT COUNT(*) FROM enrollments WHERE user_id = :enrolled_user AND status = 'en_cours') AS active_courses,
            (SELECT COUNT(*) FROM enrollments WHERE user_id = :completed_user AND status = 'termine') AS completed_courses,
            (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = :quiz_user) AS quiz_attempts,
            (SELECT COUNT(*) FROM assignment_submissions WHERE user_id = :submission_user) AS submitted_assignments,
            (SELECT COUNT(*) FROM notifications WHERE user_id = :notification_user AND is_read = 0) AS unread_notifications,
            (SELECT ROUND(AVG(final_grade), 1) FROM grades WHERE user_id = :grade_user AND is_published = 1) AS average_grade");
        $stmt->execute(['enrolled_user'=>$userId,'completed_user'=>$userId,'quiz_user'=>$userId,'submission_user'=>$userId,'notification_user'=>$userId,'grade_user'=>$userId]);
        $stats = $stmt->fetch() ?: [];
        $upcoming = $pdo->prepare("SELECT a.id, a.title, a.due_date, c.title AS course_title FROM assignments a
            JOIN courses c ON c.id=a.course_id JOIN enrollments e ON e.course_id=c.id AND e.user_id=:user_id AND e.status='en_cours'
            WHERE a.is_published=1 AND a.archived_at IS NULL AND a.due_date>=CURRENT_TIMESTAMP ORDER BY a.due_date ASC LIMIT 5");
        $upcoming->execute(['user_id'=>$userId]);
        $stats['upcoming_assignments'] = $upcoming->fetchAll();
        $courses = $pdo->prepare("SELECT c.id,c.code,c.title,u.firstname AS teacher_firstname,u.lastname AS teacher_lastname,
            (SELECT COUNT(*) FROM chapters ch JOIN lessons l ON l.chapter_id=ch.id WHERE ch.course_id=c.id) AS total_lessons,
            (SELECT COUNT(*) FROM lesson_progress lp JOIN lessons l ON l.id=lp.lesson_id JOIN chapters ch ON ch.id=l.chapter_id
             WHERE ch.course_id=c.id AND lp.user_id=:progress_user AND lp.is_completed=1) AS completed_lessons
            FROM enrollments e JOIN courses c ON c.id=e.course_id JOIN users u ON u.id=c.teacher_id
            WHERE e.user_id=:course_user AND e.status='en_cours' ORDER BY e.enrolled_at DESC LIMIT 5");
        $courses->execute(['progress_user'=>$userId,'course_user'=>$userId]);
        $stats['recent_courses'] = $courses->fetchAll();
    } elseif ($role === 'teacher') {
        $stmt = $pdo->prepare("SELECT
            (SELECT COUNT(*) FROM courses WHERE teacher_id=:courses_user AND is_published=1) AS courses_count,
            (SELECT COUNT(DISTINCT e.user_id) FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE c.teacher_id=:students_teacher AND e.status IN ('en_cours','termine')) AS students_count,
            (SELECT COUNT(*) FROM quizzes q JOIN courses c ON c.id=q.course_id WHERE c.teacher_id=:quiz_teacher) AS quizzes_count,
            (SELECT COUNT(*) FROM assignment_submissions s JOIN assignments a ON a.id=s.assignment_id JOIN courses c ON c.id=a.course_id
             WHERE c.teacher_id=:pending_teacher AND s.status IN ('rendu','en_retard')) AS pending_submissions");
        $stmt->execute(['courses_user'=>$userId,'students_teacher'=>$userId,'quiz_teacher'=>$userId,'pending_teacher'=>$userId]);
        $stats = $stmt->fetch() ?: [];
        $courses = $pdo->prepare("SELECT c.id,c.code,c.title,(SELECT COUNT(*) FROM enrollments e WHERE e.course_id=c.id AND e.status IN ('en_cours','termine')) AS students_count
            FROM courses c WHERE c.teacher_id=:teacher_id ORDER BY c.updated_at DESC LIMIT 6");
        $courses->execute(['teacher_id'=>$userId]);
        $stats['recent_courses'] = $courses->fetchAll();
        $pending = $pdo->prepare("SELECT s.id,a.title AS assignment_title,u.firstname,u.lastname,s.submitted_at FROM assignment_submissions s
            JOIN assignments a ON a.id=s.assignment_id JOIN courses c ON c.id=a.course_id JOIN users u ON u.id=s.user_id
            WHERE c.teacher_id=:teacher_id AND s.status IN ('rendu','en_retard') ORDER BY s.submitted_at ASC LIMIT 5");
        $pending->execute(['teacher_id'=>$userId]);
        $stats['pending_items'] = $pending->fetchAll();
    } elseif ($role === 'admin') {
        $stats = [
            'users_count'=>(int)$pdo->query("SELECT COUNT(*) FROM users")->fetchColumn(),
            'students_count'=>(int)$pdo->query("SELECT COUNT(*) FROM users WHERE role='student'")->fetchColumn(),
            'teachers_count'=>(int)$pdo->query("SELECT COUNT(*) FROM users WHERE role='teacher'")->fetchColumn(),
            'admins_count'=>(int)$pdo->query("SELECT COUNT(*) FROM users WHERE role='admin'")->fetchColumn(),
            'courses_count'=>(int)$pdo->query("SELECT COUNT(*) FROM courses")->fetchColumn(),
            'published_courses'=>(int)$pdo->query("SELECT COUNT(*) FROM courses WHERE is_published=1")->fetchColumn(),
            'enrollments_count'=>(int)$pdo->query("SELECT COUNT(*) FROM enrollments")->fetchColumn(),
            'quizzes_count'=>(int)$pdo->query("SELECT COUNT(*) FROM quizzes")->fetchColumn(),
            'recent_logs'=>$pdo->query("SELECT l.id,l.action,l.details,l.created_at,u.firstname,u.lastname FROM system_logs l
                LEFT JOIN users u ON u.id=l.user_id ORDER BY l.created_at DESC LIMIT 6")->fetchAll(),
        ];
    } else {
        sendJsonResponse(['success'=>false,'error'=>'Rôle non pris en charge.'],403);
    }
    sendJsonResponse(['success'=>true,'role'=>$role,'stats'=>$stats]);
} catch (PDOException $error) {
    error_log('LMS dashboard stats failed: '.$error->getMessage());
    sendJsonResponse(['success'=>false,'error'=>'Impossible de charger les indicateurs du tableau de bord. Vérifiez les migrations de la base de données.'],500);
}

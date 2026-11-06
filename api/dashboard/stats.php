<?php
/**
 * LMS Web - Données Dynamiques des Tableaux de Bord (Étudiant, Enseignant, Admin)
 * Méthode : GET
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth();
$role = $user['role'];
$userId = (int)$user['id'];
$pdo = getDB();

if ($role === 'admin') {
    $totalUsers = (int)$pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $totalStudents = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'student'")->fetchColumn();
    $totalTeachers = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'teacher'")->fetchColumn();
    $totalCourses = (int)$pdo->query("SELECT COUNT(*) FROM courses")->fetchColumn();
    $totalQuizzes = (int)$pdo->query("SELECT COUNT(*) FROM quizzes")->fetchColumn();

    $recentUsers = $pdo->query("SELECT id, firstname, lastname, role, email, avatar_initials, avatar_url, created_at FROM users ORDER BY id DESC LIMIT 5")->fetchAll();
    $recentLogs = $pdo->query("SELECT sl.*, u.firstname, u.lastname FROM system_logs sl LEFT JOIN users u ON sl.user_id = u.id ORDER BY sl.id DESC LIMIT 6")->fetchAll();

    $pendingCorrections = (int)$pdo->query("SELECT COUNT(*) FROM assignment_submissions WHERE status = 'rendu'")->fetchColumn();

    sendJsonResponse([
        'success' => true,
        'role' => 'admin',
        'stats' => [
            'total_users' => $totalUsers,
            'total_students' => $totalStudents,
            'total_teachers' => $totalTeachers,
            'total_courses' => $totalCourses,
            'total_quizzes' => $totalQuizzes,
            'pending_corrections' => $pendingCorrections,
        ],
        'recent_users' => $recentUsers,
        'system_logs' => $recentLogs
    ]);
} elseif ($role === 'teacher') {
    $coursesStmt = $pdo->prepare("SELECT COUNT(*) FROM courses WHERE teacher_id = :uid");
    $coursesStmt->execute(['uid' => $userId]);
    $myCoursesCount = (int)$coursesStmt->fetchColumn();

    $studentsStmt = $pdo->prepare("SELECT COUNT(DISTINCT e.user_id) FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE c.teacher_id = :uid AND e.status = 'en_cours'");
    $studentsStmt->execute(['uid' => $userId]);
    $myStudentsCount = (int)$studentsStmt->fetchColumn();

    $quizzesStmt = $pdo->prepare("SELECT COUNT(*) FROM quizzes q JOIN courses c ON c.id = q.course_id WHERE c.teacher_id = :uid");
    $quizzesStmt->execute(['uid' => $userId]);
    $myQuizzesCount = (int)$quizzesStmt->fetchColumn();

    $pendingStmt = $pdo->prepare("SELECT COUNT(*) FROM assignment_submissions s JOIN assignments a ON a.id = s.assignment_id JOIN courses c ON c.id = a.course_id WHERE c.teacher_id = :uid AND s.status = 'rendu'");
    $pendingStmt->execute(['uid' => $userId]);
    $pendingCorrections = (int)$pendingStmt->fetchColumn();

    $myCoursesStmt = $pdo->prepare("SELECT c.id, c.code, c.title, c.color_accent, COUNT(DISTINCT e.user_id) AS students_count FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'en_cours' WHERE c.teacher_id = :uid GROUP BY c.id, c.code, c.title, c.color_accent ORDER BY c.id");
    $myCoursesStmt->execute(['uid' => $userId]);
    $myCourses = $myCoursesStmt->fetchAll();

    sendJsonResponse([
        'success' => true,
        'role' => 'teacher',
        'stats' => [
            'my_courses' => $myCoursesCount,
            'my_students' => $myStudentsCount,
            'my_quizzes' => $myQuizzesCount,
            'to_grade' => $pendingCorrections,
        ],
        'courses' => $myCourses
    ]);
} else {
    $progressStmt = $pdo->prepare("SELECT COUNT(DISTINCT lp.lesson_id) FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id JOIN chapters ch ON ch.id = l.chapter_id JOIN enrollments e ON e.course_id = ch.course_id AND e.user_id = :uid WHERE lp.user_id = :uid2 AND lp.is_completed = 1");
    $progressStmt->execute(['uid' => $userId, 'uid2' => $userId]);
    $completedLessons = (int)$progressStmt->fetchColumn();

    $totalLessonsStmt = $pdo->prepare("SELECT COUNT(DISTINCT l.id) FROM lessons l JOIN chapters ch ON ch.id = l.chapter_id JOIN enrollments e ON e.course_id = ch.course_id AND e.user_id = :uid");
    $totalLessonsStmt->execute(['uid' => $userId]);
    $totalLessons = (int)$totalLessonsStmt->fetchColumn();

    $myGrades = $pdo->prepare("SELECT SUM(ROUND(cc_grade * 0.40 + exam_grade * 0.60, 2) * coefficient) / NULLIF(SUM(coefficient), 0) AS avg_grade FROM grades WHERE user_id = :uid AND is_published = 1");
    $myGrades->execute(['uid' => $userId]);
    $avgValue = $myGrades->fetchColumn();
    $avg = $avgValue !== false && $avgValue !== null ? round((float)$avgValue, 2) : null;

    $enrollmentStmt = $pdo->prepare("SELECT COUNT(*) FROM enrollments WHERE user_id = :uid AND status = 'en_cours'");
    $enrollmentStmt->execute(['uid' => $userId]);
    $activeCourses = (int)$enrollmentStmt->fetchColumn();

    $completedCoursesStmt = $pdo->prepare("SELECT COUNT(*) FROM enrollments WHERE user_id = :uid AND status = 'termine'");
    $completedCoursesStmt->execute(['uid' => $userId]);
    $completedCourses = (int)$completedCoursesStmt->fetchColumn();

    $globalProgress = $totalLessons > 0 ? (int)round(($completedLessons / $totalLessons) * 100) : 0;

    $learningStmt = $pdo->prepare("SELECT lp.completed_at, l.duration_minutes FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id WHERE lp.user_id = :uid AND lp.is_completed = 1 AND lp.completed_at >= :week_start");
    $weekStart = (new DateTimeImmutable('monday this week'))->setTime(0, 0)->format('Y-m-d H:i:s');
    $learningStmt->execute(['uid' => $userId, 'week_start' => $weekStart]);
    $minutesByDay = array_fill(1, 7, 0);
    foreach ($learningStmt->fetchAll() as $entry) {
        if (empty($entry['completed_at'])) continue;
        $day = (int)(new DateTimeImmutable($entry['completed_at']))->format('N');
        $minutesByDay[$day] += (int)$entry['duration_minutes'];
    }
    $weeklyMinutes = array_sum($minutesByDay);
    $learningHours = $weeklyMinutes > 0 ? intdiv($weeklyMinutes, 60) . 'h ' . ($weeklyMinutes % 60) . 'm' : '0h 0m';

    sendJsonResponse([
        'success' => true,
        'role' => 'student',
        'stats' => [
            'global_progress' => $globalProgress,
            'learning_hours' => $learningHours,
            'learning_minutes_by_day' => array_values($minutesByDay),
            'average_grade' => $avg,
            'completed_courses' => $completedCourses,
            'active_courses' => $activeCourses
        ]
    ]);
}

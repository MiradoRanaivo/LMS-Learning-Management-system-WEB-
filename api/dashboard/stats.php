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
    $totalAdmins = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'admin'")->fetchColumn();
    $totalCourses = (int)$pdo->query("SELECT COUNT(*) FROM courses")->fetchColumn();
    $totalQuizzes = (int)$pdo->query("SELECT COUNT(*) FROM quizzes")->fetchColumn();

    $recentUsers = $pdo->query("SELECT id, firstname, lastname, role, email, avatar_initials, avatar_url, created_at FROM users ORDER BY id DESC LIMIT 5")->fetchAll();
    $recentLogs = $pdo->query("SELECT sl.*, u.firstname, u.lastname FROM system_logs sl LEFT JOIN users u ON sl.user_id = u.id ORDER BY sl.id DESC LIMIT 6")->fetchAll();

    $pendingCorrections = (int)$pdo->query("SELECT COUNT(*) FROM assignment_submissions WHERE status = 'rendu'")->fetchColumn();
    $activityStmt = $pdo->query("SELECT DATE(created_at) AS activity_date,
        SUM(action = 'CONNEXION') AS logins,
        SUM(action <> 'CONNEXION') AS other_activity
        FROM system_logs
        WHERE created_at >= CURRENT_DATE - INTERVAL 6 DAY
        GROUP BY DATE(created_at)
        ORDER BY activity_date ASC");
    $activityByDate = [];
    foreach ($activityStmt->fetchAll() as $row) {
        $activityByDate[$row['activity_date']] = ['logins' => (int)$row['logins'], 'other_activity' => (int)$row['other_activity']];
    }
    $activity = [];
    for ($dayOffset = 6; $dayOffset >= 0; $dayOffset--) {
        $date = (new DateTimeImmutable('today'))->modify('-' . $dayOffset . ' days')->format('Y-m-d');
        $activity[] = ['date' => $date, 'logins' => $activityByDate[$date]['logins'] ?? 0, 'other_activity' => $activityByDate[$date]['other_activity'] ?? 0];
    }

    sendJsonResponse([
        'success' => true,
        'role' => 'admin',
        'stats' => [
            'total_users' => $totalUsers,
            'total_students' => $totalStudents,
            'total_teachers' => $totalTeachers,
            'total_admins' => $totalAdmins,
            'total_courses' => $totalCourses,
            'total_quizzes' => $totalQuizzes,
            'pending_corrections' => $pendingCorrections,
        ],
        'recent_users' => $recentUsers,
        'system_logs' => $recentLogs,
        'activity' => $activity
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

    $pendingStmt = $pdo->prepare("SELECT COUNT(*) FROM assignment_submissions s JOIN assignments a ON a.id = s.assignment_id JOIN courses c ON c.id = a.course_id WHERE c.teacher_id = :uid AND s.status IN ('rendu', 'en_retard')");
    $pendingStmt->execute(['uid' => $userId]);
    $pendingCorrections = (int)$pendingStmt->fetchColumn();

    $myCoursesStmt = $pdo->prepare("SELECT c.id, c.code, c.title, c.color_accent, COUNT(DISTINCT e.user_id) AS students_count FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'en_cours' WHERE c.teacher_id = :uid GROUP BY c.id, c.code, c.title, c.color_accent ORDER BY c.id");
    $myCoursesStmt->execute(['uid' => $userId]);
    $myCourses = $myCoursesStmt->fetchAll();

    $upcomingStmt = $pdo->prepare("SELECT a.id, a.title, a.due_date, c.title AS course_title,
        (SELECT COUNT(*) FROM assignment_submissions s WHERE s.assignment_id = a.id AND s.status IN ('rendu', 'en_retard')) AS pending_count
        FROM assignments a JOIN courses c ON c.id = a.course_id
        WHERE c.teacher_id = :uid AND a.is_published = 1 AND a.archived_at IS NULL
          AND a.due_date >= CURRENT_TIMESTAMP
          AND (a.publication_date IS NULL OR a.publication_date <= CURRENT_TIMESTAMP)
        ORDER BY a.due_date ASC LIMIT 5");
    $upcomingStmt->execute(['uid' => $userId]);
    $upcomingAssignments = $upcomingStmt->fetchAll();

    $activityStmt = $pdo->prepare("SELECT s.id, a.title AS assignment_title, c.title AS course_title,
        u.firstname, u.lastname, s.status, s.submitted_at
        FROM assignment_submissions s
        JOIN assignments a ON a.id = s.assignment_id
        JOIN courses c ON c.id = a.course_id
        JOIN users u ON u.id = s.user_id
        WHERE c.teacher_id = :uid
        ORDER BY s.submitted_at DESC LIMIT 5");
    $activityStmt->execute(['uid' => $userId]);
    $recentSubmissions = $activityStmt->fetchAll();

    sendJsonResponse([
        'success' => true,
        'role' => 'teacher',
        'stats' => [
            'my_courses' => $myCoursesCount,
            'my_students' => $myStudentsCount,
            'my_quizzes' => $myQuizzesCount,
            'to_grade' => $pendingCorrections,
        ],
        'courses' => $myCourses,
        'upcoming_assignments' => $upcomingAssignments,
        'recent_submissions' => $recentSubmissions,
    ]);
} else {
    $progressStmt = $pdo->prepare("SELECT COUNT(DISTINCT lp.lesson_id) FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id JOIN chapters ch ON ch.id = l.chapter_id JOIN enrollments e ON e.course_id = ch.course_id AND e.user_id = :uid WHERE lp.user_id = :uid2 AND lp.is_completed = 1");
    $progressStmt->execute(['uid' => $userId, 'uid2' => $userId]);
    $completedLessons = (int)$progressStmt->fetchColumn();

    $totalLessonsStmt = $pdo->prepare("SELECT COUNT(DISTINCT l.id) FROM lessons l JOIN chapters ch ON ch.id = l.chapter_id JOIN enrollments e ON e.course_id = ch.course_id AND e.user_id = :uid WHERE l.is_published = 1");
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

    // Cours réellement suivis et progression individuelle.
    $coursesStmt = $pdo->prepare("SELECT c.id, c.code, c.title, c.color_accent, u.firstname AS teacher_firstname, u.lastname AS teacher_lastname,
        COUNT(DISTINCT l.id) AS total_lessons,
        COUNT(DISTINCT CASE WHEN lp.is_completed = 1 THEN l.id END) AS completed_lessons
        FROM enrollments e
        JOIN courses c ON c.id = e.course_id
        JOIN users u ON u.id = c.teacher_id
        LEFT JOIN chapters ch ON ch.course_id = c.id
        LEFT JOIN lessons l ON l.chapter_id = ch.id AND l.is_published = 1
        LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = :progress_user
        WHERE e.user_id = :enrolled_user AND e.status = 'en_cours'
        GROUP BY c.id, c.code, c.title, c.color_accent, u.firstname, u.lastname
        ORDER BY e.enrolled_at DESC LIMIT 6");
    $coursesStmt->execute(['progress_user' => $userId, 'enrolled_user' => $userId]);
    $myCourses = $coursesStmt->fetchAll();
    foreach ($myCourses as &$course) {
        $course['progress'] = (int)$course['total_lessons'] > 0
            ? (int)round(((int)$course['completed_lessons'] / (int)$course['total_lessons']) * 100) : 0;
    }
    unset($course);

    // Prochains devoirs auxquels l'étudiant n'a pas encore remis de travail.
    $assignmentsStmt = $pdo->prepare("SELECT a.id, a.title, a.due_date, c.title AS course_title,
        CASE WHEN s.id IS NULL THEN 0 ELSE 1 END AS submitted
        FROM assignments a
        JOIN courses c ON c.id = a.course_id
        JOIN enrollments e ON e.course_id = c.id AND e.user_id = :assignment_user AND e.status = 'en_cours'
        LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.user_id = :submission_user
        WHERE a.is_published = 1 AND a.archived_at IS NULL AND a.due_date >= CURRENT_TIMESTAMP
        AND (a.publication_date IS NULL OR a.publication_date <= CURRENT_TIMESTAMP)
        ORDER BY a.due_date ASC LIMIT 5");
    $assignmentsStmt->execute(['assignment_user' => $userId, 'submission_user' => $userId]);
    $upcomingAssignments = $assignmentsStmt->fetchAll();

    // Événements du calendrier personnels, globaux ou liés aux cours suivis.
    $eventsStmt = $pdo->prepare("SELECT ce.id, ce.title, ce.event_type AS type, ce.event_date AS date, ce.event_time AS time, ce.description
        FROM calendar_events ce
        WHERE (ce.user_id IS NULL OR ce.user_id = :calendar_user)
          AND (ce.course_id IS NULL OR EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = ce.course_id AND e.user_id = :calendar_course_user AND e.status = 'en_cours'))
          AND ce.event_date BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL 45 DAY)
        UNION ALL
        SELECT a.id, a.title, 'devoir' AS type, DATE(a.due_date) AS date, TIME_FORMAT(a.due_date, '%H:%i') AS time, c.title AS description
        FROM assignments a JOIN courses c ON c.id = a.course_id
        JOIN enrollments e ON e.course_id = c.id AND e.user_id = :event_enrolled_user AND e.status = 'en_cours'
        WHERE a.is_published = 1 AND a.archived_at IS NULL AND a.due_date BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL 45 DAY)
          AND (a.publication_date IS NULL OR a.publication_date <= CURRENT_TIMESTAMP)
        ORDER BY date ASC, time ASC LIMIT 30");
    $eventsStmt->execute(['calendar_user' => $userId, 'calendar_course_user' => $userId, 'event_enrolled_user' => $userId]);
    $calendarEvents = $eventsStmt->fetchAll();

    $quizCountStmt = $pdo->prepare("SELECT COUNT(*) FROM quiz_attempts WHERE user_id = :quiz_user");
    $quizCountStmt->execute(['quiz_user' => $userId]);
    $quizAttempts = (int)$quizCountStmt->fetchColumn();

    $unreadStmt = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = :notification_user AND is_read = 0");
    $unreadStmt->execute(['notification_user' => $userId]);
    $unreadNotifications = (int)$unreadStmt->fetchColumn();

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
            'active_courses' => $activeCourses,
            'completed_lessons' => $completedLessons,
            'total_lessons' => $totalLessons,
            'quiz_attempts' => $quizAttempts,
            'unread_notifications' => $unreadNotifications,
            'upcoming_assignments' => $upcomingAssignments,
            'calendar_events' => $calendarEvents,
            'courses' => $myCourses
        ]
    ]);
}

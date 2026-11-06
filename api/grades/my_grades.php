<?php
/**
 * LMS Web - Relevé de Notes ECTS et Moyenne Générale
 * Méthode : GET
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth();
$userId = (int)$user['id'];
$pdo = getDB();

$stmt = $pdo->prepare("SELECT g.id, g.user_id, g.course_id, g.coefficient, g.is_published, g.updated_at,
        CASE WHEN g.is_published = 1 THEN g.cc_grade ELSE NULL END AS cc_grade,
        CASE WHEN g.is_published = 1 THEN g.exam_grade ELSE NULL END AS exam_grade,
        CASE WHEN g.is_published = 1 THEN g.credits_earned ELSE NULL END AS credits_earned,
        CASE WHEN g.is_published = 1 THEN g.teacher_comment ELSE NULL END AS teacher_comment,
        CASE WHEN g.is_published = 1 THEN ROUND(g.cc_grade * 0.40 + g.exam_grade * 0.60, 2) ELSE NULL END AS calculated_final,
        CASE WHEN g.is_published = 1 THEN CASE WHEN ROUND(g.cc_grade * 0.40 + g.exam_grade * 0.60, 2) >= 10 THEN 'Validé' ELSE 'Rattrapage' END ELSE 'Non publiée' END AS status,
        c.title AS course_title, c.code AS course_code, c.credits_ects, t.firstname AS teacher_firstname, t.lastname AS teacher_lastname
    FROM grades g JOIN courses c ON g.course_id = c.id JOIN users t ON t.id = c.teacher_id WHERE g.user_id = :uid ORDER BY c.id ASC");
$stmt->execute(['uid' => $userId]);
$grades = $stmt->fetchAll();

$totalWeightedGrades = 0;
$totalCoefficients = 0;
$totalCreditsEarned = 0;
$totalPossibleCredits = 0;

foreach ($grades as &$g) {
    if ((int)$g['is_published'] !== 1) {
        $g['credits_earned'] = 0;
        continue;
    }
    $coef = (float)$g['coefficient'];
    $ects = (int)$g['credits_ects'];
    
    // Calcul de la note finale : 40% CC + 60% Examen
    $final = (float)$g['calculated_final'];
    $g['credits_earned'] = $final >= 10.0 ? $ects : 0;
    
    $totalWeightedGrades += ($final * $coef);
    $totalCoefficients += $coef;
    $totalPossibleCredits += $ects;

    if ($final >= 10.0) {
        $totalCreditsEarned += $ects;
    } else {
    }
}

$average = ($totalCoefficients > 0) ? round($totalWeightedGrades / $totalCoefficients, 2) : null;

$assignmentStmt = $pdo->prepare("SELECT a.id AS assignment_id, a.title AS assignment_title, a.max_grade, c.id AS course_id, c.title AS course_title, c.code AS course_code,
        CASE WHEN s.id IS NULL THEN 'non_rendu' WHEN s.status <> 'corrige' THEN 'en_attente_correction' WHEN s.grade_published = 1 THEN 'publie' ELSE 'corrige_non_publie' END AS result_status,
        CASE WHEN s.status = 'corrige' AND s.grade_published = 1 THEN s.grade_value ELSE NULL END AS grade_value,
        CASE WHEN s.status = 'corrige' AND s.grade_published = 1 THEN s.teacher_feedback ELSE NULL END AS teacher_feedback,
        s.submitted_at, s.graded_at
    FROM assignments a JOIN courses c ON c.id = a.course_id
    JOIN enrollments e ON e.course_id = a.course_id AND e.user_id = :enrollment_user AND e.status IN ('en_cours','termine')
    LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.user_id = :submission_user
     WHERE (a.is_published = 1 AND a.archived_at IS NULL AND (a.publication_date IS NULL OR a.publication_date <= CURRENT_TIMESTAMP))
         OR (s.id IS NOT NULL AND s.status = 'corrige' AND s.grade_published = 1)
    ORDER BY c.title, a.due_date DESC");
$assignmentStmt->execute(['enrollment_user' => $userId, 'submission_user' => $userId]);
$assignmentResults = $assignmentStmt->fetchAll();

$quizStmt = $pdo->prepare("SELECT a.id AS attempt_id, a.quiz_id,
    CASE WHEN a.manual_review = 0 AND a.status <> 'manual_review' AND a.result_published = 1 THEN a.score ELSE NULL END AS score,
    a.total_questions,
    CASE WHEN a.manual_review = 0 AND a.status <> 'manual_review' AND a.result_published = 1 THEN a.percentage ELSE NULL END AS percentage,
    CASE WHEN a.manual_review = 0 AND a.status <> 'manual_review' AND a.result_published = 1 THEN a.passed ELSE NULL END AS passed,
    a.status, a.manual_review,
        q.title AS assessment_title, q.assessment_type, c.id AS course_id, c.title AS course_title, c.code AS course_code,
        (SELECT COALESCE(SUM(GREATEST(qq.points,1)),0) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS max_score,
        CASE WHEN a.manual_review = 1 OR a.status = 'manual_review' THEN 'en_attente_correction' WHEN a.result_published = 1 THEN 'publie' ELSE 'corrige_non_publie' END AS result_status,
        CASE WHEN a.manual_review = 0 AND a.status <> 'manual_review' AND a.result_published = 1 THEN a.score ELSE NULL END AS visible_score,
        CASE WHEN a.manual_review = 0 AND a.status <> 'manual_review' AND a.result_published = 1 THEN a.percentage ELSE NULL END AS visible_percentage
    FROM quiz_attempts a JOIN quizzes q ON q.id = a.quiz_id JOIN courses c ON c.id = q.course_id
    JOIN enrollments e ON e.course_id = q.course_id AND e.user_id = :enrollment_user AND e.status IN ('en_cours','termine')
    WHERE a.user_id = :attempt_user
    ORDER BY c.title, a.attempted_at DESC");
$quizStmt->execute(['enrollment_user' => $userId, 'attempt_user' => $userId]);
$quizResults = $quizStmt->fetchAll();
$feedbackStmt = $pdo->prepare("SELECT qag.attempt_id, q.question_text, qag.teacher_comment, qag.points_awarded, q.points
    FROM quiz_answer_grades qag JOIN quiz_questions q ON q.id = qag.question_id
    JOIN quiz_attempts a ON a.id = qag.attempt_id
    WHERE a.user_id = :uid AND a.result_published = 1 AND a.manual_review = 0 AND qag.teacher_comment IS NOT NULL AND qag.teacher_comment <> ''
    ORDER BY q.order_num");
$feedbackStmt->execute(['uid' => $userId]);
$quizFeedback = [];
foreach ($feedbackStmt->fetchAll() as $feedback) {
    $quizFeedback[(int)$feedback['attempt_id']][] = $feedback;
}
foreach ($quizResults as &$quizResult) {
    $quizResult['teacher_feedback'] = $quizFeedback[(int)$quizResult['attempt_id']] ?? [];
}
unset($quizResult);

sendJsonResponse([
    'success' => true,
    'student' => [
        'id' => $user['id'],
        'name' => $user['firstname'] . ' ' . $user['lastname'],
        'email' => $user['email']
    ],
    'average' => $average,
    'total_credits_earned' => $totalCreditsEarned,
    'total_possible_credits' => $totalPossibleCredits,
    'grades' => $grades,
    'assignment_results' => $assignmentResults,
    'quiz_results' => $quizResults,
]);

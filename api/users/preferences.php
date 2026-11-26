<?php
/**
 * Read or update the authenticated user's persistent preferences.
 * GET /api/users/preferences.php
 * POST { theme_id }
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth();
$pdo = getDB();
$userId = (int)$user['id'];
$themes = ['marine', 'petrol', 'indigo', 'anthracite'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare('SELECT theme_id, email_courses, email_quizzes, email_deadlines, email_forum, in_app, notification_frequency, updated_at FROM user_preferences WHERE user_id = :user_id LIMIT 1');
    $stmt->execute(['user_id' => $userId]);
    $preferences = $stmt->fetch() ?: [
        'theme_id' => 'marine', 'email_courses' => 1, 'email_quizzes' => 1,
        'email_deadlines' => 1, 'email_forum' => 1, 'in_app' => 1,
        'notification_frequency' => 'instant', 'updated_at' => null,
    ];
    sendJsonResponse(['success' => true, 'preferences' => $preferences]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: GET, POST');
    sendJsonResponse(['success' => false, 'error' => 'Méthode GET ou POST requise.'], 405);
}

verifyCsrfToken();
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$themeId = (string)($input['theme_id'] ?? '');
$frequency = (string)($input['notification_frequency'] ?? 'instant');
$booleanFields = ['email_courses', 'email_quizzes', 'email_deadlines', 'email_forum', 'in_app'];
if (!in_array($themeId, $themes, true) || !in_array($frequency, ['instant', 'daily'], true)) {
    sendJsonResponse(['success' => false, 'error' => 'Thème ou fréquence de notification invalide.'], 400);
}
foreach ($booleanFields as $field) {
    if (!array_key_exists($field, $input) || !in_array($input[$field], [0, 1, '0', '1', false, true], true)) {
        sendJsonResponse(['success' => false, 'error' => 'Préférences de notification invalides.'], 400);
    }
}
$values = array_map(static fn(string $field): int => (int)(bool)$input[$field], $booleanFields);

$stmt = $pdo->prepare('INSERT INTO user_preferences (user_id, theme_id, email_courses, email_quizzes, email_deadlines, email_forum, in_app, notification_frequency) VALUES (:user_id, :theme_id, :email_courses, :email_quizzes, :email_deadlines, :email_forum, :in_app, :frequency) ON DUPLICATE KEY UPDATE theme_id = VALUES(theme_id), email_courses = VALUES(email_courses), email_quizzes = VALUES(email_quizzes), email_deadlines = VALUES(email_deadlines), email_forum = VALUES(email_forum), in_app = VALUES(in_app), notification_frequency = VALUES(notification_frequency)');
$stmt->execute([
    'user_id' => $userId, 'theme_id' => $themeId,
    'email_courses' => $values[0], 'email_quizzes' => $values[1],
    'email_deadlines' => $values[2], 'email_forum' => $values[3],
    'in_app' => $values[4], 'frequency' => $frequency,
]);
sendJsonResponse(['success' => true, 'preferences' => [
    'theme_id' => $themeId, 'email_courses' => $values[0], 'email_quizzes' => $values[1],
    'email_deadlines' => $values[2], 'email_forum' => $values[3], 'in_app' => $values[4],
    'notification_frequency' => $frequency,
]]);
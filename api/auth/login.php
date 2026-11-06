<?php
/**
 * LMS Web - Authentification / Connexion
 * Méthode : POST
 * Paramètres : email, password
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'error' => 'Méthode non autorisée. Utilisez POST.'], 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$email = trim((string)($input['email'] ?? ''));
$password = (string)($input['password'] ?? '');

if (empty($email) || empty($password)) {
    sendJsonResponse(['success' => false, 'error' => 'Veuillez saisir votre email et votre mot de passe.'], 400);
}

$pdo = getDB();
$stmt = $pdo->prepare('SELECT id, firstname, lastname, email, password_hash, role, avatar_initials, avatar_url, phone, status FROM users WHERE email = :email LIMIT 1');
$stmt->execute(['email' => $email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    sendJsonResponse(['success' => false, 'error' => 'Identifiants incorrects.'], 401);
}

if ($user['status'] !== 'active') {
    sendJsonResponse(['success' => false, 'error' => 'Ce compte est inactif ou suspendu.'], 403);
}

if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_httponly' => true,
        'cookie_samesite' => 'Lax'
    ]);
}

session_regenerate_id(true);
unset($user['password_hash']);
$_SESSION['user'] = $user;

// Log dans le journal système
try {
    $logStmt = $pdo->prepare('INSERT INTO system_logs (user_id, action, details, ip_address) VALUES (:uid, :act, :det, :ip)');
    $logStmt->execute([
        'uid' => $user['id'],
        'act' => 'CONNEXION',
        'det' => 'Connexion de l\'utilisateur ' . $user['firstname'] . ' ' . $user['lastname'],
        'ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
    ]);
} catch (Exception $e) {
    // Ignorer si journal optionnel
}

sendJsonResponse([
    'success' => true,
    'message' => 'Connexion réussie',
    'user' => $user
]);

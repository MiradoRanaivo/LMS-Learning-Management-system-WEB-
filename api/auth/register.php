<?php
/**
 * Public LMS student registration.
 * POST { firstname, lastname, email, password, confirm_password, phone, bio }
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'error' => 'Méthode POST requise.'], 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$firstname = trim((string)($input['firstname'] ?? ''));
$lastname = trim((string)($input['lastname'] ?? ''));
$email = strtolower(trim((string)($input['email'] ?? '')));
$password = (string)($input['password'] ?? '');
$confirmPassword = (string)($input['confirm_password'] ?? $input['confirmPassword'] ?? '');
$phone = trim((string)($input['phone'] ?? ''));
$bio = trim((string)($input['bio'] ?? ''));

if ($firstname === '' || mb_strlen($firstname) > 100
    || $lastname === '' || mb_strlen($lastname) > 100
    || filter_var($email, FILTER_VALIDATE_EMAIL) === false
    || mb_strlen($email) > 191
    || strlen($phone) > 30
    || mb_strlen($bio) > 65535) {
    sendJsonResponse(['success' => false, 'error' => 'Informations d’inscription invalides.'], 400);
}

if (strlen($password) < 12 || strlen($password) > 4096) {
    sendJsonResponse(['success' => false, 'error' => 'Le mot de passe doit contenir au moins 12 caractères.'], 400);
}
if (!hash_equals($password, $confirmPassword)) {
    sendJsonResponse(['success' => false, 'error' => 'Les mots de passe ne correspondent pas.'], 400);
}

$pdo = getDB();
$existing = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
$existing->execute(['email' => $email]);
if ($existing->fetchColumn()) {
    sendJsonResponse(['success' => false, 'error' => 'Cette adresse email est déjà utilisée.'], 409);
}

$insert = $pdo->prepare("INSERT INTO users (firstname, lastname, email, password_hash, role, avatar_initials, avatar_url, phone, bio, status) VALUES (:firstname, :lastname, :email, :password_hash, 'student', :initials, NULL, :phone, :bio, 'active')");
try {
    $insert->execute([
        'firstname' => $firstname,
        'lastname' => $lastname,
        'email' => $email,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'initials' => mb_strtoupper(mb_substr($firstname, 0, 1) . mb_substr($lastname, 0, 1)),
        'phone' => $phone !== '' ? $phone : null,
        'bio' => $bio !== '' ? $bio : null,
    ]);
} catch (PDOException $error) {
    if ($error->getCode() === '23000') {
        sendJsonResponse(['success' => false, 'error' => 'Cette adresse email est déjà utilisée.'], 409);
    }
    error_log('LMS registration failed: ' . $error->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Impossible d’enregistrer le compte.'], 500);
}

$id = (int)$pdo->lastInsertId();
$user = [
    'id' => $id,
    'firstname' => $firstname,
    'lastname' => $lastname,
    'email' => $email,
    'role' => 'student',
    'avatar_initials' => mb_strtoupper(mb_substr($firstname, 0, 1) . mb_substr($lastname, 0, 1)),
    'avatar_url' => null,
    'phone' => $phone !== '' ? $phone : null,
    'status' => 'active',
];

if (session_status() === PHP_SESSION_NONE) {
    session_start(['cookie_httponly' => true, 'cookie_samesite' => 'Lax']);
}
session_regenerate_id(true);
$_SESSION['user'] = $user;

try {
    $log = $pdo->prepare('INSERT INTO system_logs (user_id, action, details, ip_address) VALUES (:user_id, :action, :details, :ip)');
    $log->execute([
        'user_id' => $id,
        'action' => 'INSCRIPTION',
        'details' => 'Création du compte étudiant ' . $firstname . ' ' . $lastname,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
    ]);
} catch (Throwable $ignored) {
}

sendJsonResponse([
    'success' => true,
    'message' => 'Compte créé avec succès.',
    'user' => $user,
    'csrf_token' => getCsrfToken(),
], 201);

<?php
/**
 * LMS Web - Profil Utilisateur & Paramètres
 * Méthode : POST
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'error' => 'Méthode POST requise.'], 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$firstname = trim((string)($input['firstname'] ?? $user['firstname']));
$lastname = trim((string)($input['lastname'] ?? $user['lastname']));
$phone = trim((string)($input['phone'] ?? $user['phone']));
$bio = trim((string)($input['bio'] ?? $user['bio'] ?? ''));

$userId = (int)$user['id'];
$initials = strtoupper(substr($firstname, 0, 1) . substr($lastname, 0, 1));

$pdo = getDB();

$stmt = $pdo->prepare("
    UPDATE users
    SET firstname = :fn, lastname = :ln, phone = :ph, bio = :bio, avatar_initials = :init
    WHERE id = :id
");
$stmt->execute([
    'fn' => $firstname,
    'ln' => $lastname,
    'ph' => $phone,
    'bio' => $bio,
    'init' => $initials,
    'id' => $userId
]);

// Mettre à jour la session
$_SESSION['user']['firstname'] = $firstname;
$_SESSION['user']['lastname'] = $lastname;
$_SESSION['user']['phone'] = $phone;
$_SESSION['user']['avatar_initials'] = $initials;

sendJsonResponse([
    'success' => true,
    'message' => 'Profil mis à jour avec succès !',
    'user' => $_SESSION['user']
]);

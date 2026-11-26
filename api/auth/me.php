<?php
/**
 * LMS Web - Utilisateur Courant
 * Méthode : GET
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

startSession();

if (!isset($_SESSION['user'])) {
    sendJsonResponse([
        'authenticated' => false,
        'user' => null
    ]);
}
$pdo = getDB();
$stmt = $pdo->prepare('SELECT avatar_url, avatar_initials FROM users WHERE id = :id LIMIT 1');
$stmt->execute(['id' => (int) $_SESSION['user']['id']]);
$profile = $stmt->fetch();

if ($profile) {
    $_SESSION['user']['avatar_url'] = $profile['avatar_url'] ?? null;
    $_SESSION['user']['avatar_initials'] = $profile['avatar_initials'] ?? $_SESSION['user']['avatar_initials'] ?? '';
}

sendJsonResponse([
    'authenticated' => true,
    'user' => $_SESSION['user'],
    'csrf_token' => getCsrfToken()
]);

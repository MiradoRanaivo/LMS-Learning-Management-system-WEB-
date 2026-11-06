<?php
/**
 * LMS Web - Déconnexion
 * Méthode : POST
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'error' => 'Méthode POST requise.'], 405);
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$_SESSION = [];
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}
session_destroy();

sendJsonResponse([
    'success' => true,
    'message' => 'Déconnexion effectuée avec succès'
]);

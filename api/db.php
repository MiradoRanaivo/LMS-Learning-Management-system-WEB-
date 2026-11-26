<?php
/**
 * LMS Web - Connexion à la Base de Données
 * PDO avec requêtes préparées et gestion des erreurs
 */

declare(strict_types=1);

function getDB(): PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $port = getenv('DB_PORT') ?: '3306';
    $dbname = getenv('DB_NAME') ?: 'lms_db';
    $user = getenv('DB_USER') ?: 'root';
    $pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';

    try {
        $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        error_log('LMS MySQL connection failed: ' . $e->getMessage());
        sendJsonResponse([
            'success' => false,
            'error' => 'Service de base de données indisponible. Vérifiez la configuration MySQL.'
        ], 503);
    }
}

function sendJsonResponse(array $data, int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function startSession(): void {
    if (session_status() !== PHP_SESSION_NONE) {
        return;
    }

    $isHttps = !empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off';
    session_start([
        'cookie_httponly' => true,
        'cookie_samesite' => 'Lax',
        'cookie_secure' => $isHttps,
    ]);
}

function checkAuth(array $allowedRoles = []): array {
    startSession();

    if (!isset($_SESSION['user'])) {
        sendJsonResponse([
            'success' => false,
            'error' => 'Non authentifié. Veuillez vous connecter.'
        ], 401);
    }

    $user = $_SESSION['user'];

    if (!empty($allowedRoles) && !in_array($user['role'], $allowedRoles, true)) {
        sendJsonResponse([
            'success' => false,
            'error' => 'Accès refusé. Privilèges insuffisants.'
        ], 403);
    }

    return $user;
}

function getCsrfToken(): string {
    startSession();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCsrfToken(): void {
    $provided = (string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    $expected = getCsrfToken();
    if ($provided === '' || !hash_equals($expected, $provided)) {
        sendJsonResponse(['success' => false, 'error' => 'Jeton CSRF invalide ou expiré. Rechargez la page.'], 403);
    }
}

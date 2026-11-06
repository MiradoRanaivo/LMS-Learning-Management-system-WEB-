<?php
/**
 * LMS Web - Gestion des Utilisateurs (Administrateur)
 * Méthode : GET (liste/détail) / POST (créer/modifier/supprimer)
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth(['admin']);
$pdo = getDB();
$roles = ['student', 'teacher', 'admin'];
$statuses = ['active', 'inactive', 'suspended'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    $role = (string)($_GET['role'] ?? 'all');
    $status = (string)($_GET['status'] ?? 'all');
    $search = trim((string)($_GET['search'] ?? ''));
    $id = (int)($_GET['id'] ?? 0);
    if ($role !== 'all' && !in_array($role, $roles, true)) {
        sendJsonResponse(['success' => false, 'error' => 'Filtre de rôle invalide.'], 400);
    }
    if ($status !== 'all' && !in_array($status, $statuses, true)) {
        sendJsonResponse(['success' => false, 'error' => 'Filtre de statut invalide.'], 400);
    }

    if ($id > 0) {
        $stmt = $pdo->prepare('SELECT id, firstname, lastname, email, role, avatar_initials, avatar_url, phone, bio, status, created_at, updated_at FROM users WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $record = $stmt->fetch();
        if (!$record) {
            sendJsonResponse(['success' => false, 'error' => 'Utilisateur introuvable.'], 404);
        }
        sendJsonResponse(['success' => true, 'user' => $record, 'csrf_token' => $_SESSION['csrf_token']]);
    }

    $where = [];
    $params = [];
    if ($role !== 'all') {
        $where[] = 'role = :role';
        $params['role'] = $role;
    }
    if ($status !== 'all') {
        $where[] = 'status = :status';
        $params['status'] = $status;
    }
    if ($search !== '') {
        $where[] = '(firstname LIKE :search OR lastname LIKE :search OR email LIKE :search)';
        $params['search'] = '%' . $search . '%';
    }
    $sql = 'SELECT id, firstname, lastname, email, role, avatar_initials, avatar_url, phone, bio, status, created_at FROM users';
    if ($where) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY id DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $counts = $pdo->query('SELECT role, COUNT(*) AS total FROM users GROUP BY role')->fetchAll(PDO::FETCH_KEY_PAIR);

    sendJsonResponse([
        'success' => true,
        'users' => $stmt->fetchAll(),
        'stats' => [
            'student' => (int)($counts['student'] ?? 0),
            'teacher' => (int)($counts['teacher'] ?? 0),
            'admin' => (int)($counts['admin'] ?? 0),
        ],
        'csrf_token' => $_SESSION['csrf_token']
    ]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: GET, POST');
    sendJsonResponse(['success' => false, 'error' => 'Méthode non autorisée.'], 405);
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$csrfToken = (string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
if (empty($_SESSION['csrf_token']) || $csrfToken === '' || !hash_equals($_SESSION['csrf_token'], $csrfToken)) {
    sendJsonResponse(['success' => false, 'error' => 'Jeton CSRF invalide ou expiré. Rechargez la page.'], 403);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST;
}
$action = (string)($input['action'] ?? '');
$name = static function (string $value, string $label): string {
    $value = trim($value);
    if ($value === '' || mb_strlen($value) > 100) {
        sendJsonResponse(['success' => false, 'error' => $label . ' obligatoire (100 caractères maximum).'], 400);
    }
    return $value;
};
$email = static function (string $value): string {
    $value = strtolower(trim($value));
    if (strlen($value) > 191 || !filter_var($value, FILTER_VALIDATE_EMAIL)) {
        sendJsonResponse(['success' => false, 'error' => 'Adresse email invalide.'], 400);
    }
    return $value;
};

try {
    if ($action === 'create') {
        $fn = $name((string)($input['firstname'] ?? ''), 'Prénom');
        $ln = $name((string)($input['lastname'] ?? ''), 'Nom');
        $em = $email((string)($input['email'] ?? ''));
        $role = (string)($input['role'] ?? 'student');
        $password = (string)($input['password'] ?? '');
        $phone = trim((string)($input['phone'] ?? ''));
        if (!in_array($role, $roles, true) || strlen($password) < 12 || strlen($password) > 4096 || strlen($phone) > 30) {
            sendJsonResponse(['success' => false, 'error' => 'Rôle, mot de passe (12 caractères minimum) ou téléphone invalide.'], 400);
        }
        $stmt = $pdo->prepare("INSERT INTO users (firstname, lastname, email, password_hash, role, avatar_initials, phone, status) VALUES (:fn, :ln, :em, :pwd, :rl, :init, :ph, 'active')");
        $stmt->execute([
            'fn' => $fn,
            'ln' => $ln,
            'em' => $em,
            'pwd' => password_hash($password, PASSWORD_DEFAULT),
            'rl' => $role,
            'init' => mb_strtoupper(mb_substr($fn, 0, 1) . mb_substr($ln, 0, 1)),
            'ph' => $phone !== '' ? $phone : null
        ]);
        sendJsonResponse(['success' => true, 'message' => 'Utilisateur créé avec succès.', 'id' => (int)$pdo->lastInsertId()], 201);
    }

    $uid = (int)($input['id'] ?? 0);
    if ($uid <= 0) {
        sendJsonResponse(['success' => false, 'error' => 'Identifiant utilisateur invalide.'], 400);
    }
    $targetStmt = $pdo->prepare('SELECT id, role, status FROM users WHERE id = :id');
    $targetStmt->execute(['id' => $uid]);
    $target = $targetStmt->fetch();
    if (!$target) {
        sendJsonResponse(['success' => false, 'error' => 'Utilisateur introuvable.'], 404);
    }

    if ($action === 'update') {
        $fn = $name((string)($input['firstname'] ?? ''), 'Prénom');
        $ln = $name((string)($input['lastname'] ?? ''), 'Nom');
        $em = $email((string)($input['email'] ?? ''));
        $role = (string)($input['role'] ?? '');
        $status = (string)($input['status'] ?? '');
        $phone = trim((string)($input['phone'] ?? ''));
        $bio = trim((string)($input['bio'] ?? ''));
        $password = (string)($input['password'] ?? '');
        if (!in_array($role, $roles, true) || !in_array($status, $statuses, true) || strlen($phone) > 30 || mb_strlen($bio) > 65535) {
            sendJsonResponse(['success' => false, 'error' => 'Rôle, statut, téléphone ou bio invalide.'], 400);
        }
        if ($password !== '' && (strlen($password) < 12 || strlen($password) > 4096)) {
            sendJsonResponse(['success' => false, 'error' => 'Le mot de passe doit contenir au moins 12 caractères.'], 400);
        }
        if ($uid === (int)$user['id'] && ($role !== 'admin' || $status !== 'active')) {
            sendJsonResponse(['success' => false, 'error' => 'Vous ne pouvez pas retirer vos propres privilèges ou désactiver votre compte.'], 400);
        }
        if ($target['role'] === 'admin' && ($role !== 'admin' || $status !== 'active')) {
            $activeAdmins = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'admin' AND status = 'active'")->fetchColumn();
            if ($activeAdmins <= 1) {
                sendJsonResponse(['success' => false, 'error' => 'Impossible de désactiver ou rétrograder le dernier administrateur actif.'], 409);
            }
        }
        $sql = 'UPDATE users SET firstname = :fn, lastname = :ln, email = :em, role = :role, status = :status, avatar_initials = :init, phone = :phone, bio = :bio';
        $params = [
            'fn' => $fn,
            'ln' => $ln,
            'em' => $em,
            'role' => $role,
            'status' => $status,
            'init' => mb_strtoupper(mb_substr($fn, 0, 1) . mb_substr($ln, 0, 1)),
            'phone' => $phone !== '' ? $phone : null,
            'bio' => $bio !== '' ? $bio : null,
            'id' => $uid
        ];
        if ($password !== '') {
            $sql .= ', password_hash = :password_hash';
            $params['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
        }
        $sql .= ' WHERE id = :id';
        $pdo->prepare($sql)->execute($params);
        sendJsonResponse(['success' => true, 'message' => 'Utilisateur mis à jour.']);
    }

    if ($action === 'delete') {
        if ($uid === (int)$user['id']) {
            sendJsonResponse(['success' => false, 'error' => 'Vous ne pouvez pas supprimer votre propre compte.'], 400);
        }
        if ($target['role'] === 'admin' && $target['status'] === 'active') {
            $activeAdmins = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'admin' AND status = 'active'")->fetchColumn();
            if ($activeAdmins <= 1) {
                sendJsonResponse(['success' => false, 'error' => 'Impossible de supprimer le dernier administrateur actif.'], 409);
            }
        }
        $relations = $pdo->query("SELECT TABLE_NAME, COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE CONSTRAINT_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME = 'users'")->fetchAll();
        foreach ($relations as $relation) {
            $table = str_replace('`', '``', $relation['TABLE_NAME']);
            $column = str_replace('`', '``', $relation['COLUMN_NAME']);
            $check = $pdo->prepare("SELECT 1 FROM `{$table}` WHERE `{$column}` = :id LIMIT 1");
            $check->execute(['id' => $uid]);
            if ($check->fetchColumn()) {
                sendJsonResponse(['success' => false, 'error' => 'Suppression refusée : cet utilisateur possède des données liées. Désactivez plutôt son compte pour préserver l’historique.'], 409);
            }
        }
        $pdo->prepare('DELETE FROM users WHERE id = :id')->execute(['id' => $uid]);
        sendJsonResponse(['success' => true, 'message' => 'Utilisateur supprimé.']);
    }

    sendJsonResponse(['success' => false, 'error' => 'Action inconnue.'], 400);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        sendJsonResponse(['success' => false, 'error' => 'Cette adresse email est déjà utilisée ou une relation empêche cette opération.'], 409);
    }
    error_log('LMS user management failed: ' . $e->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Erreur lors de l’opération sur l’utilisateur.'], 500);
}

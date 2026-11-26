<?php
/**
 * LMS Web - Gestion des catégories pédagogiques
 * Méthodes : GET / POST
 */

declare(strict_types=1);
require_once __DIR__ . '/../db.php';

$user = checkAuth(['admin', 'teacher']);
$pdo = getDB();

function normalizeCategorySlug(string $value): string {
    $slug = strtolower(trim($value));
    $slug = preg_replace('/[^a-z0-9]+/i', '-', $slug) ?? '';
    return trim((string)$slug, '-');
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $search = trim((string)($_GET['search'] ?? ''));
    $activeOnly = isset($_GET['active_only']) ? filter_var($_GET['active_only'], FILTER_VALIDATE_BOOLEAN) : false;

    $sql = 'SELECT c.* FROM categories c WHERE 1 = 1';
    $params = [];
    if ($activeOnly) {
        $sql .= ' AND c.is_active = 1';
    }
    if ($search !== '') {
        $sql .= ' AND (c.name LIKE :search_name OR c.slug LIKE :search_slug OR c.description LIKE :search_description)';
        $params['search_name'] = '%' . $search . '%';
        $params['search_slug'] = '%' . $search . '%';
        $params['search_description'] = '%' . $search . '%';
    }
    $sql .= ' ORDER BY c.sort_order ASC, c.name ASC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $categories = $stmt->fetchAll();

    foreach ($categories as &$category) {
        $countStmt = $pdo->prepare('SELECT COUNT(*) FROM courses WHERE category_id = :id');
        $countStmt->execute(['id' => (int)$category['id']]);
        $category['courses_count'] = (int)$countStmt->fetchColumn();
    }
    unset($category);

    sendJsonResponse(['success' => true, 'categories' => $categories]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'error' => 'Méthode non autorisée.'], 405);
}

verifyCsrfToken();
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$action = strtolower((string)($input['action'] ?? 'create'));

if ($action === 'delete') {
    $categoryId = (int)($input['id'] ?? 0);
    if ($categoryId <= 0) {
        sendJsonResponse(['success' => false, 'error' => 'Identifiant de catégorie invalide.'], 400);
    }

    $pdo->prepare('UPDATE courses SET category_id = NULL WHERE category_id = :id')->execute(['id' => $categoryId]);
    $pdo->prepare('DELETE FROM categories WHERE id = :id')->execute(['id' => $categoryId]);
    sendJsonResponse(['success' => true, 'message' => 'Catégorie supprimée. Les cours ont été dissociés sans être supprimés.']);
}

$name = trim((string)($input['name'] ?? ''));
$description = trim((string)($input['description'] ?? ''));

if ($name === '' || mb_strlen($name) > 100) {
    sendJsonResponse(['success' => false, 'error' => 'Le nom de la catégorie est obligatoire (100 caractères maximum).'], 400);
}

$slug = normalizeCategorySlug((string)($input['slug'] ?? $name));
if ($slug === '') {
    sendJsonResponse(['success' => false, 'error' => 'Le slug de la catégorie est invalide.'], 400);
}

if ($action === 'update') {
    $categoryId = (int)($input['id'] ?? 0);
    if ($categoryId <= 0) {
        sendJsonResponse(['success' => false, 'error' => 'Identifiant de catégorie invalide.'], 400);
    }

    $stmt = $pdo->prepare('UPDATE categories SET name = :name, slug = :slug, description = :description, is_active = :is_active, sort_order = :sort_order, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
    $stmt->execute([
        'name' => $name,
        'slug' => $slug,
        'description' => $description !== '' ? $description : null,
        'is_active' => isset($input['is_active']) ? (int)$input['is_active'] : 1,
        'sort_order' => isset($input['sort_order']) ? max(0, (int)$input['sort_order']) : 0,
        'id' => $categoryId,
    ]);
    sendJsonResponse(['success' => true, 'message' => 'Catégorie mise à jour.']);
}

$insert = $pdo->prepare('INSERT INTO categories (name, slug, description, is_active, sort_order) VALUES (:name, :slug, :description, :is_active, :sort_order)');
try {
    $insert->execute([
        'name' => $name,
        'slug' => $slug,
        'description' => $description !== '' ? $description : null,
        'is_active' => isset($input['is_active']) ? (int)$input['is_active'] : 1,
        'sort_order' => isset($input['sort_order']) ? max(0, (int)$input['sort_order']) : 0,
    ]);
    sendJsonResponse(['success' => true, 'message' => 'Catégorie créée.', 'id' => (int)$pdo->lastInsertId()], 201);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        sendJsonResponse(['success' => false, 'error' => 'Une catégorie avec ce nom ou ce slug existe déjà.'], 409);
    }
    sendJsonResponse(['success' => false, 'error' => 'Erreur lors de la création de la catégorie.'], 500);
}
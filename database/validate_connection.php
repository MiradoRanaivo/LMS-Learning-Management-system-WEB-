<?php
/**
 * Validation en lecture seule de la connexion PDO MySQL et du schéma LMS.
 * Exécuter uniquement en CLI : php database/validate_connection.php
 */

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$host = getenv('DB_HOST') ?: '127.0.0.1';
$port = getenv('DB_PORT') ?: '3306';
$dbname = getenv('DB_NAME') ?: 'lms_db';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') !== false ? (string) getenv('DB_PASS') : '';

try {
    $pdo = new PDO(
        "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    $version = $pdo->query('SELECT VERSION()')->fetchColumn();
    $tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
    $requiredTables = [
        'users', 'user_preferences', 'courses', 'chapters', 'lessons', 'enrollments',
        'lesson_progress', 'quizzes', 'quiz_questions', 'quiz_attempts', 'assignments',
        'assignment_submissions', 'grades', 'resources', 'forum_topics', 'forum_replies',
        'calendar_events', 'notifications', 'system_logs',
    ];
    $missingTables = array_values(array_diff($requiredTables, $tables));

    echo "PDO MySQL: connecté\n";
    echo "Serveur: {$version}\n";
    echo 'Base: ' . $dbname . "\n";
    echo 'Tables trouvées: ' . count($tables) . "\n";

    if ($missingTables !== []) {
        echo 'Tables manquantes: ' . implode(', ', $missingTables) . "\n";
        exit(2);
    }

    echo "Schéma requis: présent\n";
} catch (PDOException $error) {
    fwrite(STDERR, "Échec de connexion PDO/MySQL: {$error->getMessage()}\n");
    exit(1);
}

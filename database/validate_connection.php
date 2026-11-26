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
        'categories', 'users', 'user_preferences', 'teacher_follows', 'courses', 'chapters', 'lessons', 'enrollments',
        'lesson_progress', 'quizzes', 'quiz_questions', 'quiz_attempts', 'quiz_answer_grades', 'assignments',
        'assignment_submissions', 'grades', 'resources', 'forum_topics', 'forum_replies',
        'calendar_events', 'notifications', 'system_logs',
    ];
    $missingTables = array_values(array_diff($requiredTables, $tables));
    $requiredColumns = [
        'user_preferences' => ['theme_id', 'email_courses', 'email_quizzes', 'email_deadlines', 'email_forum', 'in_app', 'notification_frequency'],
        'lessons' => ['is_published'],
        'resources' => ['description', 'storage_key', 'mime_type', 'file_size_bytes', 'external_url'],
        'assignments' => ['instructions', 'publication_date', 'is_published', 'archived_at', 'attachment_key', 'attachment_name', 'attachment_extension', 'attachment_mime', 'attachment_size'],
        'assignment_submissions' => ['storage_key', 'original_file_name', 'file_extension', 'mime_type', 'file_size_bytes', 'grade_published'],
        'quizzes' => ['instructions', 'assessment_type', 'status', 'allow_multiple_attempts', 'opening_at', 'closing_at'],
        'quiz_questions' => ['question_type', 'correct_options', 'answer_text', 'points'],
        'quiz_attempts' => ['answers_json', 'status', 'manual_review', 'result_published'],
        'grades' => ['is_published', 'teacher_comment'],
    ];
    $columnQuery = $pdo->prepare('SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table');
    $missingColumns = [];
    foreach ($requiredColumns as $table => $columns) {
        if (!in_array($table, $tables, true)) {
            continue;
        }
        $columnQuery->execute(['table' => $table]);
        $presentColumns = $columnQuery->fetchAll(PDO::FETCH_COLUMN);
        foreach (array_diff($columns, $presentColumns) as $column) {
            $missingColumns[] = $table . '.' . $column;
        }
    }

    echo "PDO MySQL: connecté\n";
    echo "Serveur: {$version}\n";
    echo 'Base: ' . $dbname . "\n";
    echo 'Tables trouvées: ' . count($tables) . "\n";

    if ($missingTables !== []) {
        echo 'Tables manquantes: ' . implode(', ', $missingTables) . "\n";
    }
    if ($missingColumns !== []) {
        echo 'Colonnes de fonctionnalités manquantes: ' . implode(', ', $missingColumns) . "\n";
    }
    if ($missingTables !== [] || $missingColumns !== []) {
        exit(2);
    }

    echo "Tables et colonnes requises: présentes\n";
} catch (PDOException $error) {
    fwrite(STDERR, "Échec de connexion PDO/MySQL: {$error->getMessage()}\n");
    exit(1);
}

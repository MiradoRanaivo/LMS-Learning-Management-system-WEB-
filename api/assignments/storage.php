<?php
declare(strict_types=1);

function assignmentStorageDirectory(): string {
    $configured = getenv('LMS_RESOURCE_STORAGE_DIR');
    $root = $configured !== false && $configured !== ''
        ? rtrim($configured, DIRECTORY_SEPARATOR)
        : dirname(__DIR__, 3) . DIRECTORY_SEPARATOR . 'lms_private_uploads';
    return $root . DIRECTORY_SEPARATOR . 'assignments';
}

function validateAssignmentUpload(array $file): array {
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || !is_uploaded_file((string)($file['tmp_name'] ?? ''))) {
        sendJsonResponse(['success' => false, 'error' => 'Téléversement impossible.'], 400);
    }

    $size = (int)($file['size'] ?? 0);
    if ($size <= 0 || $size > 15 * 1024 * 1024) {
        sendJsonResponse(['success' => false, 'error' => 'Le fichier doit faire moins de 15 Mo.'], 400);
    }

    $extension = strtolower(pathinfo((string)($file['name'] ?? ''), PATHINFO_EXTENSION));
    $allowed = [
        'pdf' => ['application/pdf'],
        'doc' => ['application/msword', 'application/octet-stream'],
        'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'],
        'xls' => ['application/vnd.ms-excel', 'application/octet-stream'],
        'xlsx' => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip'],
        'ppt' => ['application/vnd.ms-powerpoint', 'application/octet-stream'],
        'pptx' => ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/zip'],
        'zip' => ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'],
    ];
    if (!isset($allowed[$extension])) {
        sendJsonResponse(['success' => false, 'error' => 'Extension de fichier non autorisée.'], 400);
    }

    $mime = (new finfo(FILEINFO_MIME_TYPE))->file((string)$file['tmp_name']);
    if (!is_string($mime) || !in_array($mime, $allowed[$extension], true)) {
        sendJsonResponse(['success' => false, 'error' => 'Le type MIME ne correspond pas à l’extension.'], 400);
    }

    $originalName = basename(str_replace('\\', '/', (string)$file['name']));
    $originalName = preg_replace('/[\x00-\x1F\x7F]/u', '', $originalName) ?: 'document.' . $extension;
    return [
        'extension' => $extension,
        'mime' => $mime,
        'size' => $size,
        'name' => mb_substr($originalName, 0, 255),
    ];
}

function saveAssignmentUpload(array $file, array $metadata): string {
    $directory = assignmentStorageDirectory();
    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
        sendJsonResponse(['success' => false, 'error' => 'Stockage des fichiers indisponible.'], 500);
    }

    $realDirectory = realpath($directory);
    $documentRoot = isset($_SERVER['DOCUMENT_ROOT']) ? realpath((string)$_SERVER['DOCUMENT_ROOT']) : false;
    if (!$realDirectory || ($documentRoot && str_starts_with($realDirectory . DIRECTORY_SEPARATOR, rtrim($documentRoot, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR))) {
        sendJsonResponse(['success' => false, 'error' => 'Le stockage des devoirs doit être hors du dossier public.'], 500);
    }

    $key = bin2hex(random_bytes(24));
    if (!move_uploaded_file((string)$file['tmp_name'], $realDirectory . DIRECTORY_SEPARATOR . $key . '.' . $metadata['extension'])) {
        sendJsonResponse(['success' => false, 'error' => 'Impossible de stocker le fichier.'], 500);
    }
    return $key;
}

function removeAssignmentUpload(?string $key, ?string $extension): void {
    if (!$key || !preg_match('/^[a-f0-9]{48}$/', $key) || !$extension || !preg_match('/^(pdf|doc|docx|xls|xlsx|ppt|pptx|zip)$/', $extension)) {
        return;
    }
    $path = assignmentStorageDirectory() . DIRECTORY_SEPARATOR . $key . '.' . $extension;
    if (is_file($path)) {
        @unlink($path);
    }
}

function resolveAssignmentUpload(?string $key, ?string $extension): ?string {
    if (!$key || !preg_match('/^[a-f0-9]{48}$/', $key) || !$extension || !preg_match('/^(pdf|doc|docx|xls|xlsx|ppt|pptx|zip)$/', $extension)) {
        return null;
    }
    $directory = realpath(assignmentStorageDirectory());
    $path = $directory ? realpath($directory . DIRECTORY_SEPARATOR . $key . '.' . $extension) : false;
    return $path && str_starts_with($path, $directory . DIRECTORY_SEPARATOR) && is_file($path) ? $path : null;
}

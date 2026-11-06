<?php
declare(strict_types=1);

function resourceStorageDirectory(): string {
    $configured = getenv('LMS_RESOURCE_STORAGE_DIR');
    return $configured !== false && $configured !== ''
        ? rtrim($configured, DIRECTORY_SEPARATOR)
        : dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'lms_private_uploads';
}

function validateResourceUpload(array $file): array {
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
        'ppt' => ['application/vnd.ms-powerpoint', 'application/octet-stream'],
        'pptx' => ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/zip'],
        'doc' => ['application/msword', 'application/octet-stream'],
        'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'],
        'xls' => ['application/vnd.ms-excel', 'application/octet-stream'],
        'xlsx' => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip'],
        'jpg' => ['image/jpeg'], 'jpeg' => ['image/jpeg'], 'png' => ['image/png'],
        'gif' => ['image/gif'], 'webp' => ['image/webp'],
    ];
    if (!isset($allowed[$extension])) sendJsonResponse(['success' => false, 'error' => 'Extension de fichier non autorisée.'], 400);
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = (string)$finfo->file((string)$file['tmp_name']);
    if (!in_array($mime, $allowed[$extension], true)) sendJsonResponse(['success' => false, 'error' => 'Le type MIME ne correspond pas à l’extension.'], 400);
    return ['extension' => $extension, 'mime' => $mime, 'size' => $size];
}

function saveResourceUpload(array $file, array $metadata): string {
    $directory = resourceStorageDirectory();
    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
        sendJsonResponse(['success' => false, 'error' => 'Stockage des fichiers indisponible.'], 500);
    }
    $key = bin2hex(random_bytes(24));
    if (!move_uploaded_file((string)$file['tmp_name'], $directory . DIRECTORY_SEPARATOR . $key . '.' . $metadata['extension'])) {
        sendJsonResponse(['success' => false, 'error' => 'Impossible de stocker le fichier.'], 500);
    }
    return $key;
}

function removeStoredResource(string $key, ?string $mime): void {
    if (!preg_match('/^[a-f0-9]{48}$/', $key)) return;
    $extensions = [
        'application/pdf' => ['pdf'], 'application/vnd.ms-powerpoint' => ['ppt'],
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' => ['pptx'],
        'application/msword' => ['doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => ['docx'],
        'application/vnd.ms-excel' => ['xls'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => ['xlsx'],
        'image/jpeg' => ['jpg', 'jpeg'], 'image/png' => ['png'], 'image/gif' => ['gif'], 'image/webp' => ['webp'],
    ];
    foreach ($extensions[$mime ?? ''] ?? [] as $extension) {
        $path = resourceStorageDirectory() . DIRECTORY_SEPARATOR . $key . '.' . $extension;
        if (is_file($path)) { @unlink($path); return; }
    }
}
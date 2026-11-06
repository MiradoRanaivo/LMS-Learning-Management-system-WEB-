<?php
/**
 * LMS Web - Plateforme Universitaire
 * Point d'entrée principal pour serveur Apache / XAMPP
 */

session_start([
    'cookie_httponly' => true,
    'cookie_samesite' => 'Lax'
]);

// Si l'utilisateur est déjà connecté, redirection vers son dashboard respectif
if (isset($_SESSION['user']) && isset($_SESSION['user']['role'])) {
    $role = $_SESSION['user']['role'];
    if ($role === 'teacher') {
        header('Location: pages/dashboard-teacher.html');
        exit;
    } elseif ($role === 'admin') {
        header('Location: pages/dashboard-admin.html');
        exit;
    } else {
        header('Location: pages/dashboard-student.html');
        exit;
    }
}

// Sinon redirection vers la page d'authentification
header('Location: pages/login.html');
exit;

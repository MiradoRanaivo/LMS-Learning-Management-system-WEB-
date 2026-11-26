-- =====================================================================
-- LMS Web - Base de données Relationnelle Universitaire
-- Compatible : MySQL 8.0+ / MariaDB 10.4+ / XAMPP
-- Encodage : utf8mb4 (support complet des accents et emojis)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `lms_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `lms_db`;

-- ---------------------------------------------------------------------
-- 1a. TABLE : categories (Catégories pédagogiques)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_categories_active` (`is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 1. TABLE : users (Utilisateurs de la plateforme)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `firstname` VARCHAR(100) NOT NULL,
  `lastname` VARCHAR(100) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'teacher', 'admin') NOT NULL DEFAULT 'student',
  `avatar_initials` VARCHAR(4) NOT NULL,
  `avatar_url` VARCHAR(500) DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 1b. TABLE : user_preferences (Préférences persistantes par utilisateur)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_preferences` (
  `user_id` INT UNSIGNED PRIMARY KEY,
  `theme_id` ENUM('marine', 'petrol', 'indigo', 'anthracite') NOT NULL DEFAULT 'marine',
  `email_courses` TINYINT(1) NOT NULL DEFAULT 1,
  `email_quizzes` TINYINT(1) NOT NULL DEFAULT 1,
  `email_deadlines` TINYINT(1) NOT NULL DEFAULT 1,
  `email_forum` TINYINT(1) NOT NULL DEFAULT 1,
  `in_app` TINYINT(1) NOT NULL DEFAULT 1,
  `notification_frequency` ENUM('instant', 'daily') NOT NULL DEFAULT 'instant',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- TABLE : teacher_follows (Suivi des enseignants par les étudiants)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `teacher_follows` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT UNSIGNED NOT NULL,
  `teacher_id` INT UNSIGNED NOT NULL,
  `followed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_teacher_follow` (`student_id`, `teacher_id`),
  INDEX `idx_teacher_follows_teacher` (`teacher_id`),
  FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. TABLE : courses (Cours universitaires)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `courses` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `category_id` INT UNSIGNED DEFAULT NULL,
  `teacher_id` INT UNSIGNED NOT NULL,
  `level` ENUM('Débutant', 'Intermédiaire', 'Avancé') NOT NULL DEFAULT 'Débutant',
  `hours_total` INT UNSIGNED NOT NULL DEFAULT 12,
  `credits_ects` INT UNSIGNED NOT NULL DEFAULT 4,
  `semester` VARCHAR(10) NOT NULL DEFAULT 'S1',
  `color_accent` VARCHAR(20) NOT NULL DEFAULT '#059669',
  `image_banner` VARCHAR(255) DEFAULT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  INDEX `idx_courses_category` (`category_id`),
  INDEX `idx_courses_teacher` (`teacher_id`),
  INDEX `idx_courses_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. TABLE : chapters (Chapitres des cours)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `chapters` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT UNSIGNED NOT NULL,
  `order_num` INT UNSIGNED NOT NULL DEFAULT 1,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  INDEX `idx_chapters_course` (`course_id`, `order_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. TABLE : lessons (Leçons détaillées avec contenu pédagogique)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `lessons` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `chapter_id` INT UNSIGNED NOT NULL,
  `order_num` INT UNSIGNED NOT NULL DEFAULT 1,
  `title` VARCHAR(200) NOT NULL,
  `summary` VARCHAR(255) DEFAULT NULL,
  `content` MEDIUMTEXT NOT NULL,
  `duration_minutes` INT UNSIGNED NOT NULL DEFAULT 20,
  `has_video` TINYINT(1) NOT NULL DEFAULT 0,
  `video_url` VARCHAR(255) DEFAULT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE,
  INDEX `idx_lessons_chapter` (`chapter_id`, `order_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. TABLE : enrollments (Inscriptions des étudiants aux cours)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `enrollments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `course_id` INT UNSIGNED NOT NULL,
  `status` ENUM('en_cours', 'termine', 'abandonne') NOT NULL DEFAULT 'en_cours',
  `enrolled_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME DEFAULT NULL,
  UNIQUE KEY `uniq_enrollment` (`user_id`, `course_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. TABLE : lesson_progress (Progression individuelle des leçons)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `lesson_progress` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `lesson_id` INT UNSIGNED NOT NULL,
  `is_completed` TINYINT(1) NOT NULL DEFAULT 0,
  `completed_at` DATETIME DEFAULT NULL,
  UNIQUE KEY `uniq_lesson_progress` (`user_id`, `lesson_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. TABLE : quizzes (Évaluations formatives et sommatives)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quizzes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `assessment_type` ENUM('quiz', 'exam') NOT NULL DEFAULT 'quiz',
  `description` TEXT DEFAULT NULL,
  `instructions` TEXT DEFAULT NULL,
  `duration_minutes` INT UNSIGNED NOT NULL DEFAULT 20,
  `pass_score_percent` INT UNSIGNED NOT NULL DEFAULT 60,
  `max_score` INT UNSIGNED NOT NULL DEFAULT 100,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published',
  `allow_multiple_attempts` TINYINT(1) NOT NULL DEFAULT 0,
  `opening_at` DATETIME DEFAULT NULL,
  `closing_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  INDEX `idx_quizzes_course` (`course_id`),
  INDEX `idx_quizzes_dates` (`opening_at`, `closing_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. TABLE : quiz_questions (Questions de quiz avec choix A, B, C, D)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quiz_questions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `quiz_id` INT UNSIGNED NOT NULL,
  `order_num` INT UNSIGNED NOT NULL DEFAULT 1,
  `question_text` TEXT NOT NULL,
  `question_type` ENUM('single', 'multiple', 'truefalse', 'short_text', 'essay') NOT NULL DEFAULT 'single',
  `option_a` TEXT NOT NULL,
  `option_b` TEXT NOT NULL,
  `option_c` TEXT NOT NULL,
  `option_d` TEXT NOT NULL,
  `correct_option` ENUM('a', 'b', 'c', 'd') DEFAULT NULL,
  `correct_options` VARCHAR(255) DEFAULT NULL,
  `answer_text` TEXT DEFAULT NULL,
  `explanation` TEXT DEFAULT NULL,
  `points` INT UNSIGNED NOT NULL DEFAULT 1,
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  INDEX `idx_quiz_questions_quiz` (`quiz_id`, `order_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 9. TABLE : quiz_attempts (Tentatives et résultats des étudiants)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quiz_attempts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `quiz_id` INT UNSIGNED NOT NULL,
  `score` INT UNSIGNED NOT NULL DEFAULT 0,
  `total_questions` INT UNSIGNED NOT NULL DEFAULT 0,
  `percentage` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `passed` TINYINT(1) NOT NULL DEFAULT 0,
  `answers_json` JSON DEFAULT NULL,
  `status` ENUM('passed', 'failed', 'manual_review') NOT NULL DEFAULT 'failed',
  `manual_review` TINYINT(1) NOT NULL DEFAULT 0,
  `result_published` TINYINT(1) NOT NULL DEFAULT 0,
  `attempted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  INDEX `idx_quiz_attempts_user_quiz` (`user_id`, `quiz_id`),
  INDEX `idx_quiz_attempts_quiz_time` (`quiz_id`, `attempted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 9a. TABLE : quiz_answer_grades (Corrections manuelles par réponse libre)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quiz_answer_grades` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `attempt_id` INT UNSIGNED NOT NULL,
  `question_id` INT UNSIGNED NOT NULL,
  `graded_by` INT UNSIGNED NOT NULL,
  `points_awarded` INT UNSIGNED NOT NULL DEFAULT 0,
  `teacher_comment` TEXT DEFAULT NULL,
  `graded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_quiz_answer_grade` (`attempt_id`, `question_id`),
  FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`graded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 10. TABLE : assignments (Devoirs universitaires à rendre)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `assignments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `instructions` TEXT DEFAULT NULL,
  `due_date` DATETIME NOT NULL,
  `publication_date` DATETIME DEFAULT NULL,
  `max_grade` DECIMAL(4,2) NOT NULL DEFAULT 20.00,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `archived_at` DATETIME DEFAULT NULL,
  `attachment_key` CHAR(48) DEFAULT NULL,
  `attachment_name` VARCHAR(255) DEFAULT NULL,
  `attachment_extension` VARCHAR(10) DEFAULT NULL,
  `attachment_mime` VARCHAR(100) DEFAULT NULL,
  `attachment_size` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  INDEX `idx_assignments_course` (`course_id`),
  INDEX `idx_assignments_visibility` (`course_id`, `is_published`, `publication_date`, `archived_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 11. TABLE : assignment_submissions (Rendus et corrections)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `assignment_submissions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `assignment_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `file_url` VARCHAR(255) DEFAULT NULL,
  `storage_key` CHAR(48) DEFAULT NULL,
  `original_file_name` VARCHAR(255) DEFAULT NULL,
  `file_extension` VARCHAR(10) DEFAULT NULL,
  `mime_type` VARCHAR(100) DEFAULT NULL,
  `file_size_bytes` BIGINT UNSIGNED DEFAULT NULL,
  `student_comment` TEXT DEFAULT NULL,
  `grade_value` DECIMAL(4,2) DEFAULT NULL,
  `teacher_feedback` TEXT DEFAULT NULL,
  `status` ENUM('rendu', 'corrige', 'en_retard') NOT NULL DEFAULT 'rendu',
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `graded_at` DATETIME DEFAULT NULL,
  `grade_published` TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY `uniq_submission` (`assignment_id`, `user_id`),
  FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 12. TABLE : grades (Relevé de notes ECTS officiel)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `grades` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `course_id` INT UNSIGNED NOT NULL,
  `cc_grade` DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  `exam_grade` DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  `final_grade` DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  `coefficient` DECIMAL(3,1) NOT NULL DEFAULT 2.0,
  `credits_earned` INT UNSIGNED NOT NULL DEFAULT 0,
  `status` ENUM('Validé', 'Rattrapage', 'En attente') NOT NULL DEFAULT 'En attente',
  `is_published` TINYINT(1) NOT NULL DEFAULT 0,
  `teacher_comment` TEXT DEFAULT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_user_course_grade` (`user_id`, `course_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 13. TABLE : resources (Bibliothèque de documents, PDF, vidéos, liens)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `resources` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT UNSIGNED DEFAULT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `type` ENUM('document', 'cours', 'video', 'lien', 'image') NOT NULL DEFAULT 'document',
  `file_format` VARCHAR(20) NOT NULL DEFAULT 'PDF',
  `file_size` VARCHAR(30) NOT NULL DEFAULT '1.5 Mo',
  `file_url` VARCHAR(255) NOT NULL,
  `storage_key` VARCHAR(64) DEFAULT NULL,
  `mime_type` VARCHAR(100) DEFAULT NULL,
  `file_size_bytes` BIGINT UNSIGNED DEFAULT NULL,
  `external_url` VARCHAR(2048) DEFAULT NULL,
  `uploader_id` INT UNSIGNED NOT NULL,
  `published_date` DATE NOT NULL,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`uploader_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_resources_course_date` (`course_id`, `published_date`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 14. TABLE : forum_topics (Sujets de discussion)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `forum_topics` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT UNSIGNED NOT NULL,
  `author_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `is_resolved` TINYINT(1) NOT NULL DEFAULT 0,
  `views_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 15. TABLE : forum_replies (Réponses du forum)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `forum_replies` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `topic_id` INT UNSIGNED NOT NULL,
  `author_id` INT UNSIGNED NOT NULL,
  `content` TEXT NOT NULL,
  `likes_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `is_solution` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`topic_id`) REFERENCES `forum_topics` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 16. TABLE : calendar_events (Calendrier universitaire)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `calendar_events` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `course_id` INT UNSIGNED DEFAULT NULL,
  `title` VARCHAR(200) NOT NULL,
  `event_type` ENUM('quiz', 'devoir', 'cours', 'reunion', 'examen') NOT NULL DEFAULT 'cours',
  `event_date` DATE NOT NULL,
  `event_time` VARCHAR(10) NOT NULL DEFAULT '10:00',
  `description` VARCHAR(255) DEFAULT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 17. TABLE : notifications (Système d'alertes)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('grade', 'assignment', 'course', 'forum', 'system') NOT NULL DEFAULT 'system',
  `link_url` VARCHAR(255) DEFAULT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 18. TABLE : system_logs (Journal d'activité pour l'Administrateur)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `system_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


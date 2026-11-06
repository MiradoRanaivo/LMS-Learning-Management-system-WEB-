-- Migration non destructive : preferences persistantes du compte LMS.
-- À exécuter manuellement dans la base lms_db après sauvegarde.
-- Cette migration ne modifie ni ne supprime les tables ou données existantes.

CREATE TABLE IF NOT EXISTS `user_preferences` (
  `user_id` INT UNSIGNED PRIMARY KEY,
  `theme_id` ENUM('marine', 'petrol', 'indigo', 'anthracite') NOT NULL DEFAULT 'marine',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_user_preferences_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

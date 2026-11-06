-- Additive, data-preserving upgrade for quiz and exam management.
-- Safe to apply to the existing LMS database: only nullable/defaulted columns
-- are added, and existing correct options are retained.

ALTER TABLE `quizzes`
  ADD COLUMN IF NOT EXISTS `instructions` TEXT DEFAULT NULL AFTER `description`,
  ADD COLUMN IF NOT EXISTS `max_score` INT UNSIGNED NOT NULL DEFAULT 100 AFTER `pass_score_percent`,
  ADD COLUMN IF NOT EXISTS `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published' AFTER `is_active`,
  ADD COLUMN IF NOT EXISTS `allow_multiple_attempts` TINYINT(1) NOT NULL DEFAULT 0 AFTER `status`,
  ADD COLUMN IF NOT EXISTS `opening_at` DATETIME DEFAULT NULL AFTER `allow_multiple_attempts`,
  ADD COLUMN IF NOT EXISTS `closing_at` DATETIME DEFAULT NULL AFTER `opening_at`;

ALTER TABLE `quiz_questions`
  ADD COLUMN IF NOT EXISTS `question_type` ENUM('single', 'multiple', 'truefalse', 'short_text', 'essay') NOT NULL DEFAULT 'single' AFTER `question_text`,
  MODIFY COLUMN `correct_option` ENUM('a', 'b', 'c', 'd') DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `correct_options` VARCHAR(255) DEFAULT NULL AFTER `correct_option`,
  ADD COLUMN IF NOT EXISTS `answer_text` TEXT DEFAULT NULL AFTER `correct_options`,
  ADD COLUMN IF NOT EXISTS `points` INT UNSIGNED NOT NULL DEFAULT 1 AFTER `explanation`;

ALTER TABLE `quiz_attempts`
  ADD COLUMN IF NOT EXISTS `answers_json` JSON DEFAULT NULL AFTER `passed`,
  ADD COLUMN IF NOT EXISTS `status` ENUM('passed', 'failed', 'manual_review') NOT NULL DEFAULT 'failed' AFTER `answers_json`,
  ADD COLUMN IF NOT EXISTS `manual_review` TINYINT(1) NOT NULL DEFAULT 0 AFTER `status`;

CREATE INDEX IF NOT EXISTS `idx_quizzes_dates` ON `quizzes` (`opening_at`, `closing_at`);
CREATE INDEX IF NOT EXISTS `idx_quiz_attempts_user_quiz` ON `quiz_attempts` (`user_id`, `quiz_id`);
CREATE INDEX IF NOT EXISTS `idx_quiz_attempts_quiz_time` ON `quiz_attempts` (`quiz_id`, `attempted_at`);

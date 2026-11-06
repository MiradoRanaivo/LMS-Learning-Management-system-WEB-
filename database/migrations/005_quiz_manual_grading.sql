-- Additive, data-preserving storage for per-answer manual grading.
-- Existing quiz attempts and answers remain unchanged.
CREATE TABLE IF NOT EXISTS `quiz_answer_grades` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `attempt_id` INT UNSIGNED NOT NULL,
  `question_id` INT UNSIGNED NOT NULL,
  `graded_by` INT UNSIGNED NOT NULL,
  `points_awarded` INT UNSIGNED NOT NULL DEFAULT 0,
  `teacher_comment` TEXT DEFAULT NULL,
  `graded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_quiz_answer_grade` (`attempt_id`, `question_id`),
  CONSTRAINT `fk_quiz_answer_grades_attempt` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_quiz_answer_grades_question` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_quiz_answer_grades_teacher` FOREIGN KEY (`graded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

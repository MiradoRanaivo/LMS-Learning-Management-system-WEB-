-- Additive, backwards-compatible publication controls.
-- Defaults preserve visibility of all historical grades and assessment results.
ALTER TABLE `grades`
  ADD COLUMN IF NOT EXISTS `is_published` TINYINT(1) NOT NULL DEFAULT 1 AFTER `status`,
  ADD COLUMN IF NOT EXISTS `teacher_comment` TEXT DEFAULT NULL AFTER `is_published`;

ALTER TABLE `assignment_submissions`
  ADD COLUMN IF NOT EXISTS `grade_published` TINYINT(1) NOT NULL DEFAULT 1 AFTER `graded_at`;

ALTER TABLE `quiz_attempts`
  ADD COLUMN IF NOT EXISTS `result_published` TINYINT(1) NOT NULL DEFAULT 1 AFTER `manual_review`;

ALTER TABLE `quizzes`
  ADD COLUMN IF NOT EXISTS `assessment_type` ENUM('quiz', 'exam') NOT NULL DEFAULT 'quiz' AFTER `title`;

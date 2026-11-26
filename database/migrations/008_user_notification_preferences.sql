-- Additive user notification preferences; preserve existing theme selections.
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS email_courses TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS email_quizzes TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS email_deadlines TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS email_forum TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS in_app TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS notification_frequency ENUM('instant', 'daily') NOT NULL DEFAULT 'instant';
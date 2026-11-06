-- Set publication flags to fail closed for newly created grades and results.
-- Existing published records are preserved; only column defaults are changed.

ALTER TABLE grades
  MODIFY COLUMN is_published TINYINT(1) NOT NULL DEFAULT 0;

ALTER TABLE assignment_submissions
  MODIFY COLUMN grade_published TINYINT(1) NOT NULL DEFAULT 0;

ALTER TABLE quiz_attempts
  MODIFY COLUMN result_published TINYINT(1) NOT NULL DEFAULT 0;

-- Incomplete manual reviews cannot be published; normalize legacy default-1 rows.
UPDATE quiz_attempts
SET result_published = 0
WHERE manual_review = 1 OR status = 'manual_review';
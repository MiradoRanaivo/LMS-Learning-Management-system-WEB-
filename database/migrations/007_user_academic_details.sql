-- Add the academic identifiers collected by the student registration form.
-- Safe for existing installations: existing users keep NULL values.
ALTER TABLE users
  ADD COLUMN student_id VARCHAR(50) DEFAULT NULL UNIQUE AFTER email,
  ADD COLUMN department VARCHAR(150) DEFAULT NULL AFTER student_id;

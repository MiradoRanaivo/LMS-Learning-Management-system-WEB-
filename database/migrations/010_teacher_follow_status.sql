-- Migration 010 : statuts des demandes de suivi enseignant.
-- IMPORTANT : effectuer une sauvegarde de la base avant d'exécuter cette migration.
-- Migration idempotente : conserve les lignes et les identifiants existants.

SET @teacher_follow_status_sql = (
  SELECT IF(
    COUNT(*) = 0,
    "ALTER TABLE teacher_follows ADD COLUMN status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending' AFTER teacher_id",
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'teacher_follows'
    AND COLUMN_NAME = 'status'
);
PREPARE teacher_follow_status_stmt FROM @teacher_follow_status_sql;
EXECUTE teacher_follow_status_stmt;
DEALLOCATE PREPARE teacher_follow_status_stmt;

SET @teacher_follow_reviewed_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE teacher_follows ADD COLUMN reviewed_at DATETIME NULL DEFAULT NULL AFTER followed_at',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'teacher_follows'
    AND COLUMN_NAME = 'reviewed_at'
);
PREPARE teacher_follow_reviewed_stmt FROM @teacher_follow_reviewed_sql;
EXECUTE teacher_follow_reviewed_stmt;
DEALLOCATE PREPARE teacher_follow_reviewed_stmt;

SET @teacher_follow_index_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'CREATE INDEX idx_teacher_follows_status ON teacher_follows (teacher_id, status)',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'teacher_follows'
    AND INDEX_NAME = 'idx_teacher_follows_status'
);
PREPARE teacher_follow_index_stmt FROM @teacher_follow_index_sql;
EXECUTE teacher_follow_index_stmt;
DEALLOCATE PREPARE teacher_follow_index_stmt;


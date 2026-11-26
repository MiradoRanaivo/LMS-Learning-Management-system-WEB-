-- Compatibilite des bases existantes : les anciennes tables lessons
-- peuvent ne pas encore posseder le champ utilise par le catalogue et les API.
-- Cette migration est re-executable sans erreur si la colonne existe deja.

SET @lesson_publication_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE lessons ADD COLUMN is_published TINYINT(1) NOT NULL DEFAULT 1 AFTER video_url',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'lessons'
    AND COLUMN_NAME = 'is_published'
);

PREPARE lesson_publication_stmt FROM @lesson_publication_sql;
EXECUTE lesson_publication_stmt;
DEALLOCATE PREPARE lesson_publication_stmt;

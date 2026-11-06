-- Étape 8 : gestion des devoirs et dépôt privé des fichiers.
-- Migration additive : ne supprime ni ne remplace les données existantes.
-- À auditer sur la base cible avant exécution; ce fichier n'a pas été exécuté.

ALTER TABLE assignments
  ADD COLUMN instructions TEXT DEFAULT NULL AFTER description,
  ADD COLUMN publication_date DATETIME DEFAULT NULL AFTER due_date,
  ADD COLUMN is_published TINYINT(1) NOT NULL DEFAULT 1 AFTER max_grade,
  ADD COLUMN archived_at DATETIME DEFAULT NULL AFTER is_published,
  ADD COLUMN attachment_key CHAR(48) DEFAULT NULL AFTER archived_at,
  ADD COLUMN attachment_name VARCHAR(255) DEFAULT NULL AFTER attachment_key,
  ADD COLUMN attachment_extension VARCHAR(10) DEFAULT NULL AFTER attachment_name,
  ADD COLUMN attachment_mime VARCHAR(100) DEFAULT NULL AFTER attachment_extension,
  ADD COLUMN attachment_size BIGINT UNSIGNED DEFAULT NULL AFTER attachment_mime;

ALTER TABLE assignment_submissions
  ADD COLUMN storage_key CHAR(48) DEFAULT NULL AFTER file_url,
  ADD COLUMN original_file_name VARCHAR(255) DEFAULT NULL AFTER storage_key,
  ADD COLUMN file_extension VARCHAR(10) DEFAULT NULL AFTER original_file_name,
  ADD COLUMN mime_type VARCHAR(100) DEFAULT NULL AFTER file_extension,
  ADD COLUMN file_size_bytes BIGINT UNSIGNED DEFAULT NULL AFTER mime_type;

CREATE INDEX idx_assignments_visibility ON assignments (course_id, is_published, publication_date, archived_at);

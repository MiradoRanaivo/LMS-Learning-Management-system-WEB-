-- Extension des leçons et ressources pour la gestion pédagogique sécurisée.
ALTER TABLE lessons
  ADD COLUMN is_published TINYINT(1) NOT NULL DEFAULT 1 AFTER video_url;

ALTER TABLE resources
  MODIFY COLUMN type ENUM('document', 'cours', 'video', 'lien', 'image') NOT NULL DEFAULT 'document',
  ADD COLUMN description TEXT DEFAULT NULL AFTER title,
  ADD COLUMN storage_key VARCHAR(64) DEFAULT NULL AFTER file_url,
  ADD COLUMN mime_type VARCHAR(100) DEFAULT NULL AFTER storage_key,
  ADD COLUMN file_size_bytes BIGINT UNSIGNED DEFAULT NULL AFTER mime_type,
  ADD COLUMN external_url VARCHAR(2048) DEFAULT NULL AFTER file_size_bytes;

CREATE INDEX idx_resources_course_date ON resources (course_id, published_date, id);
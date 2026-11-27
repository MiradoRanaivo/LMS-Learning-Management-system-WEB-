-- Étape manuelle de validation des demandes de suivi enseignant/étudiant.
-- Les relations déjà présentes restent automatiquement approuvées.
ALTER TABLE teacher_follows
  ADD COLUMN status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved' AFTER teacher_id,
  ADD COLUMN reviewed_at DATETIME NULL DEFAULT NULL AFTER followed_at,
  ADD INDEX idx_teacher_follows_status (teacher_id, status);

-- =====================================================================
-- LMS Web - Données d'Initialisation & Démonstration
-- Fichier de démonstration uniquement : ne pas exécuter sur une base réelle.
-- L'application PHP ne lance jamais ce fichier automatiquement.
-- Mot de passe par défaut pour tous les comptes : "password123"
-- Hash BCrypt : $2y$10$eA0Y5p4h5Qe1yD7x0y8kheLd74L1h6h64sK2O7jD5Jz5pLgTfD4C.
-- (Généré avec password_hash('password123', PASSWORD_BCRYPT))
-- =====================================================================

USE `lms_db`;

-- ---------------------------------------------------------------------
-- Insertion des catégories pédagogiques
-- ---------------------------------------------------------------------
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `is_active`, `sort_order`) VALUES
(1, 'Frontend & Backend', 'frontend-backend', 'Développement web, intégration, API et application multi-couches.', 1, 1),
(2, 'SQL & Modélisation', 'sql-modelisation', 'Bases de données relationnelles, schéma logique et requêtes avancées.', 1, 2),
(3, 'Systèmes & TCP/IP', 'systemes-tcp-ip', 'Réseaux, protocoles, routage et sécurité des communications.', 1, 3),
(4, 'Fondamentaux', 'fondamentaux', 'Algorithmique, structures de données et bases de la pensée computationnelle.', 1, 4),
(5, 'Système & Bas Niveau', 'systeme-bas-niveau', 'Programmation système, pointeurs et optimisation mémoire.', 1, 5),
(6, 'Méthodes & UML', 'methodes-uml', 'Méthodes de conception, modélisation UML et gestion de projet agile.', 1, 6),
(7, 'Kernel & Processus', 'kernel-processus', 'Systèmes d’exploitation, ordonnancement et gestion des ressources.', 1, 7),
(8, 'Architectures SI', 'architectures-si', 'Analyse, conception d’entreprise et architecture applicative.', 1, 8),
(9, 'Cybersécurité', 'cybersecurite', 'Sécurité des systèmes, cryptographie et bonnes pratiques de protection.', 1, 9),
(10, 'Backend Universitaire', 'backend-universitaire', 'Développement serveur, sessions, authentification et intégration PHP/MySQL.', 1, 10)
ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug), description = VALUES(description), is_active = VALUES(is_active), sort_order = VALUES(sort_order);

-- ---------------------------------------------------------------------
-- Insertion des Utilisateurs (Étudiants, Enseignants, Administrateur)
-- ---------------------------------------------------------------------
INSERT INTO `users` (`id`, `firstname`, `lastname`, `email`, `password_hash`, `role`, `avatar_initials`, `avatar_url`, `phone`, `bio`, `status`) VALUES
(1, 'Andry', 'Rakoto', 'andry.rakoto@exemple.com', '$2y$12$c0zKcfInk8KDSYg9je.SYunBVGHp.oOYdmgh2lEgBGebGoO2qMhm2', 'student', 'AR', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80', '+261 34 12 345 67', 'Étudiant en Licence 3 Informatique, passionné par le Web et les architectures distribuées.', 'active'),
(2, 'Fara', 'Randria', 'fara.randria@exemple.com', '$2y$12$c0zKcfInk8KDSYg9je.SYunBVGHp.oOYdmgh2lEgBGebGoO2qMhm2', 'student', 'FR', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80', '+261 32 45 678 90', 'Étudiante en Génie Logiciel, passionnée par l''UX et le développement mobile.', 'active'),
(3, 'Toky', 'Rabe', 'toky.rabe@exemple.com', '$2y$12$c0zKcfInk8KDSYg9je.SYunBVGHp.oOYdmgh2lEgBGebGoO2qMhm2', 'student', 'TR', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80', '+261 33 21 987 65', 'Étudiant en Administration Systèmes & Réseaux.', 'active'),
(4, 'Mialy', 'Razafindrakoto', 'mialy.razaf@exemple.com', '$2y$12$c0zKcfInk8KDSYg9je.SYunBVGHp.oOYdmgh2lEgBGebGoO2qMhm2', 'student', 'MR', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80', '+261 34 88 123 45', 'Étudiante en Data Science & Intelligence Artificielle.', 'active'),
(5, 'Dr. Tahina', 'Ramanantsoa', 'tahina.ramanantsoa@exemple.com', '$2y$12$c0zKcfInk8KDSYg9je.SYunBVGHp.oOYdmgh2lEgBGebGoO2qMhm2', 'teacher', 'TR', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80', '+261 34 01 234 56', 'Maître de Conférences en Informatique, spécialité Technologies Web & Bases de Données.', 'active'),
(6, 'Prof. Lova', 'Razafindrazaka', 'lova.razaf@exemple.com', '$2y$12$c0zKcfInk8KDSYg9je.SYunBVGHp.oOYdmgh2lEgBGebGoO2qMhm2', 'teacher', 'LR', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80', '+261 32 99 876 54', 'Professeur Titulaire, Responsable du département Réseaux & Télécommunications.', 'active'),
(7, 'Tiana', 'Rasoanaivo', 'tiana.rasoanaivo@exemple.com', '$2y$12$c0zKcfInk8KDSYg9je.SYunBVGHp.oOYdmgh2lEgBGebGoO2qMhm2', 'admin', 'AD', 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=256&h=256&q=80', '+261 33 11 222 33', 'Administratrice Principale de la Plateforme Numérique Universitaire.', 'active');

-- ---------------------------------------------------------------------
-- Insertion des 10 Cours Informatiques Officiels
-- ---------------------------------------------------------------------
INSERT INTO `courses` (`id`, `code`, `title`, `description`, `category_id`, `teacher_id`, `level`, `hours_total`, `credits_ects`, `semester`, `color_accent`, `is_published`) VALUES
(1, 'INF-103', 'Développement Web', 'Apprenez les bases et architectures du développement web moderne avec HTML5, CSS3, JavaScript ES6+ et PHP/MySQL.', 1, 5, 'Débutant', 12, 5, 'S1', '#059669', 1),
(2, 'INF-104', 'Bases de données', 'Modélisation entité-association, algèbre relationnelle, langage SQL avancé, optimisation de requêtes et transactions ACID.', 2, 5, 'Intermédiaire', 15, 5, 'S1', '#047857', 1),
(3, 'INF-105', 'Réseaux informatiques', 'Architecture des réseaux en couches OSI/TCP-IP, adressage IPv4/IPv6, routage dynamique, DNS, DHCP et protocoles de transport.', 3, 6, 'Intermédiaire', 14, 4, 'S1', '#0D9488', 1),
(4, 'INF-101', 'Algorithmique et structures de données', 'Complexité temporelle, algorithmes de tri, listes chaînées, piles, files, arbres binaires de recherche et graphes.', 4, 5, 'Débutant', 18, 6, 'S1', '#064E3B', 1),
(5, 'INF-102', 'Programmation C/C++', 'Gestion bas-niveau de la mémoire, pointeurs, structures, allocation dynamique, programmation orientée objet en C++.', 5, 5, 'Intermédiaire', 16, 5, 'S1', '#0F766E', 1),
(6, 'INF-106', 'Génie logiciel', 'Cycle de vie des logiciels, modélisation UML, design patterns du GoF, méthodologies agiles (Scrum) et tests unitaires.', 6, 5, 'Avancé', 12, 4, 'S2', '#047857', 1),
(7, 'INF-107', 'Systèmes d''exploitation', 'Processus, threads, ordonnancement CPU, synchronisation (sémaphores, mutex), gestion de la mémoire virtuelle et pagination.', 7, 6, 'Intermédiaire', 14, 4, 'S1', '#065F46', 1),
(8, 'INF-108', 'Analyse et conception des systèmes', 'Ingénierie des exigences, diagrammes de cas d''utilisation, diagrammes de séquences, cahier des charges et architecture applicative.', 8, 5, 'Avancé', 10, 3, 'S2', '#059669', 1),
(9, 'INF-109', 'Développement d''applications', 'Développement d''applications modernes, architectures MVC, injection de dépendances, API RESTful et persistance.', 10, 5, 'Avancé', 15, 5, 'S2', '#10B981', 1),
(10, 'INF-110', 'Sécurité informatique', 'Fondamentaux de la cryptographie, attaques courantes (injection SQL, XSS, CSRF), sécurisation réseau et politique d''accès.', 9, 6, 'Avancé', 12, 4, 'S2', '#047857', 1);

-- ---------------------------------------------------------------------
-- Insertion des Chapitres pour Développement Web (INF-103)
-- ---------------------------------------------------------------------
INSERT INTO `chapters` (`id`, `course_id`, `order_num`, `title`, `description`) VALUES
(1, 1, 1, 'Chapitre 1 : Introduction au web', 'Historique, fonctionnement du protocole HTTP/HTTPS et architecture client-serveur.'),
(2, 1, 2, 'Chapitre 2 : HTML & CSS', 'Sémantique HTML5, mise en page moderne avec Flexbox, CSS Grid et responsive design.'),
(3, 1, 3, 'Chapitre 3 : JavaScript', 'Syntaxe moderne ES6+, manipulation du DOM, événements et requêtes asynchrones Fetch.'),
(4, 1, 4, 'Chapitre 4 : PHP & Sessions', 'Bases de PHP 8, formulaires, superglobales, sessions et cookies sécurisés.'),
(5, 1, 5, 'Chapitre 5 : Projet final & BDD', 'Connexion PDO MySQL, architecture MVC et déploiement applicatif.');

-- ---------------------------------------------------------------------
-- Insertion des Leçons Pédagogiques Détaillées
-- ---------------------------------------------------------------------
INSERT INTO `lessons` (`id`, `chapter_id`, `order_num`, `title`, `summary`, `content`, `duration_minutes`, `has_video`, `video_url`) VALUES
(1, 1, 1, 'Architecture Client-Serveur et Protocole HTTP', 'Comprendre les mécanismes sous-jacents aux requêtes et réponses web.', '<h3>1. Le modèle Client-Serveur</h3><p>Dans l''architecture web classique, le client (généralement un navigateur web tel que Chrome ou Firefox) émet des requêtes HTTP vers un serveur web (Apache, Nginx). Le serveur analyse la requête, exécute le script PHP nécessaire et retourne une réponse HTTP constituée d''un code d''état (200 OK, 404 Not Found) et d''un corps de document (HTML, JSON).</p><h3>2. Méthodes HTTP Principales</h3><ul><li><strong>GET :</strong> Demande une ressource sans effet de bord. Les paramètres transitent dans l''URL.</li><li><strong>POST :</strong> Transmet des données au serveur (par exemple lors de la soumission d''un formulaire sécurisé).</li><li><strong>PUT / DELETE :</strong> Modification ou suppression de ressources REST.</li></ul>', 25, 0, NULL),
(2, 2, 1, 'Structure Sémantique HTML5 et Bonnes Pratiques', 'Balises sémantiques <header>, <nav>, <main>, <section>, <article> et <aside>.', '<h3>Sémantique HTML5</h3><p>L''utilisation de balises sémantiques est essentielle pour l''accessibilité (WCAG), le référencement (SEO) et la lisibilité du code. Plutôt que d''imbriquer des conteneurs génériques <code>&lt;div&gt;</code>, nous utilisons :</p><pre><code>&lt;main class="lms-content"&gt;\n  &lt;header class="page-title"&gt;\n    &lt;h1&gt;Développement Web&lt;/h1&gt;\n  &lt;/header&gt;\n  &lt;article&gt;Contenu du cours&lt;/article&gt;\n&lt;/main&gt;</code></pre>', 30, 0, NULL),
(3, 2, 2, 'Mise en page Moderne : Flexbox et Grid Layout', 'Créer des interfaces fluides et adaptées à tous les écrans universitaires.', '<h3>CSS Grid et Flexbox</h3><p>Flexbox gère la disposition unidimensionnelle (en ligne ou en colonne) tandis que CSS Grid permet un agencement bidimensionnel complexe, parfait pour les tableaux de bord et grilles de cours du LMS.</p>', 35, 1, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
(4, 3, 1, 'Variables, Types et Portée (let, const, var)', 'Comprendre la déclaration de variable moderne et les closures en JavaScript.', '<h3>Déclaration des variables en JavaScript</h3><p>Depuis la spécification ECMAScript 2015 (ES6), l''utilisation de <code>var</code> est déconseillée au profit de <code>let</code> et <code>const</code> qui possèdent une portée de bloc.</p><pre><code>// Bonne syntaxe pour déclarer une variable modifiable\nlet nom = "Jean Martin";\n\n// Déclaration d''une constante non réassignable\nconst university = "Université Numérique";</code></pre><p>Une variable déclarée avec <code>let</code> ne subit pas de hoisting involontaire et protège contre les fuites de mémoire dans les boucles.</p>', 20, 0, NULL),
(5, 3, 2, 'Manipulation du DOM et Gestion des Événements', 'Interagir avec la page sans rechargement grâce à l''API standard du DOM.', '<h3>Sélection et Écouteurs</h3><p>En Vanilla JS, nous utilisons <code>document.querySelector()</code> et <code>addEventListener()</code> pour manipuler les composants d''interface avec performance et légèreté.</p>', 30, 0, NULL),
(6, 4, 1, 'Gestion des Sessions PHP Sécurisées', 'Démarrer une session, stocker les données utilisateur et contrer le vol de session.', '<h3>Sessions en PHP 8</h3><p>Une session permet de conserver l''état de connexion d''un étudiant ou enseignant à travers les pages du LMS.</p><pre><code>session_start([\n    ''cookie_httponly'' => true,\n    ''cookie_samesite'' => ''Lax''\n]);\n$_SESSION[''user_id''] = $user[''id''];\n$_SESSION[''role''] = $user[''role''];</code></pre>', 25, 0, NULL);

-- ---------------------------------------------------------------------
-- Inscription des étudiants et progression de démonstration
-- ---------------------------------------------------------------------
INSERT INTO `enrollments` (`user_id`, `course_id`, `status`) VALUES
(1, 1, 'en_cours'), -- Andry inscrit à Développement Web (72%)
(1, 2, 'en_cours'), -- Andry inscrit à Bases de données (54%)
(1, 3, 'en_cours'), -- Andry inscrit à Réseaux (38%)
(1, 9, 'en_cours'), -- Andry inscrit à PHP Avancé (61%)
(2, 1, 'en_cours'),
(3, 3, 'en_cours');

-- Leçons complétées par Andry (ID 1) pour correspondre exactement à la maquette
INSERT INTO `lesson_progress` (`user_id`, `lesson_id`, `is_completed`, `completed_at`) VALUES
(1, 1, 1, '2026-10-15 14:30:00'),
(1, 2, 1, '2026-10-18 10:15:00'),
(1, 3, 1, '2026-10-20 16:45:00');

-- ---------------------------------------------------------------------
-- Quiz Officiel : Variables et Types en JavaScript
-- ---------------------------------------------------------------------
INSERT INTO `quizzes` (`id`, `course_id`, `title`, `description`, `duration_minutes`, `pass_score_percent`, `is_active`) VALUES
(1, 1, 'Quiz – Variables et types', 'Évaluation formative sur les déclarations, types primitifs et portée en JavaScript moderne ES6.', 20, 60, 1),
(2, 2, 'Quiz – Requêtes SQL et Jointures', 'Test sur SELECT, INNER JOIN, LEFT JOIN et fonctions d''agrégation.', 25, 60, 1);

INSERT INTO `quiz_questions` (`id`, `quiz_id`, `order_num`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `explanation`) VALUES
(1, 1, 1, 'Quel mot-clé introduit en ES6 permet de déclarer une constante dont la référence ne peut pas être réassignée ?', 'constant', 'const', 'let', 'final', 'b', 'Le mot-clé const garantit l''immuabilité de la référence de la variable.'),
(2, 1, 2, 'Quelle est la valeur de retour de : typeof null en JavaScript ?', '"null"', '"undefined"', '"object"', '"boolean"', 'c', 'typeof null retourne "object" pour des raisons historiques de compatibilité du moteur JS.'),
(3, 1, 3, 'Quelle est la bonne syntaxe pour déclarer une variable modifiable en JavaScript ?', 'let nom = "Jean";', 'var nom = "Jean";', 'const nom = "Jean";', 'nom = "Jean";', 'a', 'let nom = "Jean"; est la syntaxe standard recommandée pour une variable réassignable.'),
(4, 1, 4, 'Quelle est la différence fondamentale entre == et === ?', 'Aucune différence', '== vérifie le type et la valeur, === convertit', '=== compare la valeur et le type strict sans conversion', '== est réservé aux chaînes de caractères', 'c', 'L''opérateur d''égalité stricte === ne pratique aucun transtypage implicite.'),
(5, 1, 5, 'Comment déclare-t-on un tableau vide en JavaScript ?', 'let arr = ();', 'let arr = [];', 'let arr = {};', 'let arr = new Array[];', 'b', 'Les crochets [] représentent la notation littérale pour initialiser un tableau.');

-- ---------------------------------------------------------------------
-- Devoirs Universitaires & Évaluations
-- ---------------------------------------------------------------------
INSERT INTO `assignments` (`id`, `course_id`, `title`, `description`, `due_date`, `max_grade`) VALUES
(1, 1, 'TP 1 : Création d''une interface responsive en CSS Grid', 'Réaliser la maquette complète du tableau de bord étudiant avec respect de la sémantique HTML5 et adaptation mobile.', '2026-10-26 23:59:00', 20.00),
(2, 2, 'Exercice SQL : Modélisation d''une clinique universitaire', 'Créer le schéma relationnel, les clés étrangères et rédiger 5 requêtes de jointure complexes.', '2026-10-27 18:00:00', 20.00),
(3, 1, 'Mini-Projet : Calculateur de moyenne ECTS en Vanilla JS', 'Développer un script interactif avec stockage localStorage pour calculer les moyennes pondérées.', '2026-11-05 20:00:00', 20.00);

INSERT INTO `assignment_submissions` (`id`, `assignment_id`, `user_id`, `file_url`, `student_comment`, `grade_value`, `teacher_feedback`, `status`, `submitted_at`, `graded_at`) VALUES
(1, 1, 1, 'uploads/devoir_web_andry.zip', 'Bonjour Monsieur, voici mon travail avec le code HTML/CSS validé au W3C.', 17.50, 'Excellent travail. La grille responsive est propre et les contrastes de couleur respectent parfaitement les maquettes.', 'corrige', '2026-10-21 16:30:00', '2026-10-22 09:15:00');

-- ---------------------------------------------------------------------
-- Relevé de Notes ECTS Officiel (Pour l'étudiant Andry Rakoto)
-- ---------------------------------------------------------------------
INSERT INTO `grades` (`user_id`, `course_id`, `cc_grade`, `exam_grade`, `final_grade`, `coefficient`, `credits_earned`, `status`) VALUES
(1, 1, 17.50, 16.00, 16.60, 2.0, 5, 'Validé'),
(1, 2, 14.00, 15.50, 14.90, 2.0, 5, 'Validé'),
(1, 3, 12.00, 13.00, 12.60, 1.5, 4, 'Validé'),
(1, 4, 15.00, 14.00, 14.40, 2.5, 6, 'Validé'),
(1, 5, 11.00, 10.50, 10.70, 2.0, 5, 'Validé');

-- ---------------------------------------------------------------------
-- Bibliothèque de Ressources Téléchargeables
-- ---------------------------------------------------------------------
INSERT INTO `resources` (`id`, `course_id`, `title`, `type`, `file_format`, `file_size`, `file_url`, `uploader_id`, `published_date`) VALUES
(1, 1, 'Guide JavaScript Moderne (PDF)', 'document', 'PDF', '2.4 Mo', 'resources/guide-javascript-es6.pdf', 5, '2026-10-12'),
(2, 1, 'Exemple de projet PHP 8 & PDO', 'cours', 'ZIP', '1.8 Mo', 'resources/projet-php-pdo.zip', 5, '2026-10-10'),
(3, 2, 'Vidéos - Bases de données relationnelles', 'video', 'MP4', '85 Mo', 'https://youtube.com/watch?v=sample-db', 5, '2026-10-08'),
(4, 1, 'Fiche récapitulative HTML5 / CSS3', 'document', 'PDF', '824 Ko', 'resources/cheatsheet-html-css.pdf', 5, '2026-10-05'),
(5, 3, 'Cours complet Réseaux & Modèle OSI', 'cours', 'PDF', '4.2 Mo', 'resources/cours-reseaux-tcpip.pdf', 6, '2026-10-02');

-- ---------------------------------------------------------------------
-- Forum Universitaire : Sujets & Réponses
-- ---------------------------------------------------------------------
INSERT INTO `forum_topics` (`id`, `course_id`, `author_id`, `title`, `content`, `is_resolved`, `views_count`, `created_at`) VALUES
(1, 1, 1, 'Différence entre Flexbox et Grid pour la sidebar du LMS ?', 'Bonjour à tous, dans le TP de développement web, faut-il privilégier display: grid ou display: flex pour structurer la navigation latérale avec l''avatar fixé en bas ?', 1, 42, '2026-10-21 09:12:00'),
(2, 2, 2, 'Erreur de clé étrangère 1452 sur MariaDB', 'J''obtiens une erreur Cannot add or update a child row lors de l''insertion dans assignment_submissions. Quelqu''un a une idée ?', 0, 19, '2026-10-22 14:05:00');

INSERT INTO `forum_replies` (`id`, `topic_id`, `author_id`, `content`, `likes_count`, `is_solution`, `created_at`) VALUES
(1, 1, 5, 'Bonjour Andry. Pour la sidebar complète, flexbox avec flex-direction: column et margin-top: auto pour le bloc utilisateur inférieur est la solution la plus robuste et adaptable.', 8, 1, '2026-10-21 11:20:00'),
(2, 2, 5, 'Bonjour Fara. Assurez-vous que l''enregistrement utilisateur (user_id) existe bien dans la table `users` avant d''insérer dans la table enfant.', 3, 0, '2026-10-22 15:30:00');

-- ---------------------------------------------------------------------
-- Calendrier Universitaire
-- ---------------------------------------------------------------------
INSERT INTO `calendar_events` (`id`, `user_id`, `course_id`, `title`, `event_type`, `event_date`, `event_time`, `description`) VALUES
(1, 1, 1, 'Quiz : Variables et types', 'quiz', '2026-10-26', '10:00', 'Quiz en ligne sur la plateforme (durée 20 min).'),
(2, 1, 2, 'Rendre le devoir : Exercice SQL', 'devoir', '2026-10-27', '11:00', 'Dépôt du script SQL de modélisation.'),
(3, 1, 1, 'Cours : PHP Avancé', 'cours', '2026-10-28', '14:00', 'Amphithéâtre C & Diffusion en direct.'),
(4, 1, 1, 'Réunion de groupe de projet', 'reunion', '2026-10-30', '16:00', 'Point d''avancement sur le LMS en salle informatique.');

-- ---------------------------------------------------------------------
-- Notifications Utilisateur
-- ---------------------------------------------------------------------
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `link_url`, `is_read`, `created_at`) VALUES
(1, 1, 'Note publiée', 'Votre note pour le TP 1 (Développement Web) est disponible : 17.5 / 20.', 'grade', 'grades.html', 0, '2026-10-22 09:16:00'),
(2, 1, 'Échéance proche', 'Le devoir d''Exercice SQL doit être rendu demain avant 18:00.', 'assignment', 'assignments.html', 0, '2026-10-25 08:00:00'),
(3, 1, 'Réponse sur le forum', 'Le Dr. Tahina Ramanantsoa a répondu à votre sujet "Différence entre Flexbox et Grid".', 'forum', 'forum.html', 1, '2026-10-21 11:21:00');

-- ---------------------------------------------------------------------
-- Journal Système (Pour le Tableau de bord Administrateur)
-- ---------------------------------------------------------------------
INSERT INTO `system_logs` (`id`, `user_id`, `action`, `details`, `ip_address`, `created_at`) VALUES
(1, 7, 'CONNEXION_ADMIN', 'Connexion réussie de l''administrateur principal', '192.168.1.10', '2026-10-25 07:45:00'),
(2, 5, 'MODIFICATION_COURS', 'Mise à jour du chapitre 3 de Développement Web (INF-103)', '192.168.1.45', '2026-10-25 08:30:00'),
(3, 1, 'SOUMISSION_DEVOIR', 'Dépôt du TP 1 par Andry Rakoto', '192.168.1.102', '2026-10-25 09:12:00'),
(4, 7, 'CREATION_UTILISATEUR', 'Création du compte étudiant Toky Rabe', '192.168.1.10', '2026-10-25 09:40:00');

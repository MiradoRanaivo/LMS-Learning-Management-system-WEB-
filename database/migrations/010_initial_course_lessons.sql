-- Ajoute un chapitre et deux leçons initiales aux cours qui n'en ont pas encore.
-- Migration additive et re-exécutable : ne modifie ni ne supprime les contenus existants.
-- Prérequis : database/schema.sql (nouvelle base) ou les migrations LMS existantes,
-- notamment 009_lesson_publication_compat.sql (base déjà créée).

INSERT INTO chapters (course_id, order_num, title, description)
SELECT c.id, 1, 'Fondamentaux et mise en pratique', 'Notions essentielles du cours suivies d’une première application guidée.'
FROM courses c
WHERE c.code = 'INF-104'
  AND NOT EXISTS (SELECT 1 FROM chapters ch WHERE ch.course_id = c.id AND ch.title = 'Fondamentaux et mise en pratique')
UNION ALL
SELECT c.id, 1, 'Fondamentaux et mise en pratique', 'Notions essentielles du cours suivies d’une première application guidée.'
FROM courses c
WHERE c.code = 'INF-105'
  AND NOT EXISTS (SELECT 1 FROM chapters ch WHERE ch.course_id = c.id AND ch.title = 'Fondamentaux et mise en pratique')
UNION ALL
SELECT c.id, 1, 'Fondamentaux et mise en pratique', 'Notions essentielles du cours suivies d’une première application guidée.'
FROM courses c
WHERE c.code = 'INF-101'
  AND NOT EXISTS (SELECT 1 FROM chapters ch WHERE ch.course_id = c.id AND ch.title = 'Fondamentaux et mise en pratique')
UNION ALL
SELECT c.id, 1, 'Fondamentaux et mise en pratique', 'Notions essentielles du cours suivies d’une première application guidée.'
FROM courses c
WHERE c.code = 'INF-102'
  AND NOT EXISTS (SELECT 1 FROM chapters ch WHERE ch.course_id = c.id AND ch.title = 'Fondamentaux et mise en pratique')
UNION ALL
SELECT c.id, 1, 'Fondamentaux et mise en pratique', 'Notions essentielles du cours suivies d’une première application guidée.'
FROM courses c
WHERE c.code = 'INF-106'
  AND NOT EXISTS (SELECT 1 FROM chapters ch WHERE ch.course_id = c.id AND ch.title = 'Fondamentaux et mise en pratique')
UNION ALL
SELECT c.id, 1, 'Fondamentaux et mise en pratique', 'Notions essentielles du cours suivies d’une première application guidée.'
FROM courses c
WHERE c.code = 'INF-107'
  AND NOT EXISTS (SELECT 1 FROM chapters ch WHERE ch.course_id = c.id AND ch.title = 'Fondamentaux et mise en pratique')
UNION ALL
SELECT c.id, 1, 'Fondamentaux et mise en pratique', 'Notions essentielles du cours suivies d’une première application guidée.'
FROM courses c
WHERE c.code = 'INF-108'
  AND NOT EXISTS (SELECT 1 FROM chapters ch WHERE ch.course_id = c.id AND ch.title = 'Fondamentaux et mise en pratique')
UNION ALL
SELECT c.id, 1, 'Fondamentaux et mise en pratique', 'Notions essentielles du cours suivies d’une première application guidée.'
FROM courses c
WHERE c.code = 'INF-109'
  AND NOT EXISTS (SELECT 1 FROM chapters ch WHERE ch.course_id = c.id AND ch.title = 'Fondamentaux et mise en pratique')
UNION ALL
SELECT c.id, 1, 'Fondamentaux et mise en pratique', 'Notions essentielles du cours suivies d’une première application guidée.'
FROM courses c
WHERE c.code = 'INF-110'
  AND NOT EXISTS (SELECT 1 FROM chapters ch WHERE ch.course_id = c.id AND ch.title = 'Fondamentaux et mise en pratique');

INSERT INTO lessons (chapter_id, order_num, title, summary, content, duration_minutes, is_published)
SELECT ch.id, 1, 'Modéliser les données avec le modèle relationnel', 'Transformer un besoin métier en tables, clés et relations cohérentes.', '<h2>Du besoin au schéma relationnel</h2><p>Repérez d’abord les entités, leurs propriétés et les associations décrites par le besoin. Une table représente une entité ; sa clé primaire identifie chaque ligne. Les clés étrangères matérialisent les relations et garantissent leur intégrité.</p><h3>Exercice guidé</h3><p>Pour une bibliothèque universitaire, identifiez les tables Adhérent, Livre et Emprunt. Un emprunt relie un adhérent à un livre et conserve les dates de sortie et de retour. Déterminez les clés primaires et étrangères, puis vérifiez qu’un même livre peut être emprunté plusieurs fois à des dates différentes.</p>', 30, 1
FROM chapters ch JOIN courses c ON c.id = ch.course_id
WHERE c.code = 'INF-104' AND ch.title = 'Fondamentaux et mise en pratique'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.chapter_id = ch.id AND l.title = 'Modéliser les données avec le modèle relationnel')
UNION ALL
SELECT ch.id, 2, 'Écrire des requêtes SQL fiables', 'Interroger et modifier les données avec des requêtes lisibles.', '<h2>Interrogation des tables</h2><p>Une requête SELECT choisit les colonnes, filtre les lignes avec WHERE et ordonne le résultat avec ORDER BY. Les jointures relient les tables à partir de clés communes ; les fonctions COUNT, SUM et AVG résument un ensemble de lignes.</p><h3>À retenir</h3><p>Utilisez des paramètres préparés pour toute valeur fournie par un utilisateur. Pour une modification cohérente de plusieurs tables, regroupez les opérations dans une transaction et validez-la seulement si toutes réussissent.</p>', 35, 1
FROM chapters ch JOIN courses c ON c.id = ch.course_id
WHERE c.code = 'INF-104' AND ch.title = 'Fondamentaux et mise en pratique'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.chapter_id = ch.id AND l.title = 'Écrire des requêtes SQL fiables')
UNION ALL
SELECT ch.id, 1, 'Comprendre les couches réseau', 'Situer les protocoles et le trajet d’une communication.', '<h2>Modèles OSI et TCP/IP</h2><p>Les modèles en couches séparent les responsabilités d’une communication. Dans TCP/IP, l’application produit les données, le transport organise les échanges, Internet assure l’adressage et le routage, et l’accès réseau transmet les trames sur le lien physique.</p><h3>Observation</h3><p>Lorsqu’un navigateur ouvre un site, DNS résout son nom, TCP établit une connexion fiable et TLS protège les échanges HTTPS. Chaque couche ajoute ses informations de contrôle avant l’envoi.</p>', 25, 1
FROM chapters ch JOIN courses c ON c.id = ch.course_id
WHERE c.code = 'INF-105' AND ch.title = 'Fondamentaux et mise en pratique'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.chapter_id = ch.id AND l.title = 'Comprendre les couches réseau')
UNION ALL
SELECT ch.id, 2, 'Adresser et diagnostiquer un réseau IP', 'Utiliser les adresses et outils de diagnostic de base.', '<h2>Adressage et connectivité</h2><p>Une adresse IP identifie une interface dans un réseau. Le préfixe CIDR sépare la partie réseau de la partie hôte. La passerelle par défaut permet de joindre les réseaux distants ; DNS associe les noms de domaine aux adresses.</p><h3>Exercice</h3><p>Sur un poste de test, relevez l’adresse, le préfixe et la passerelle. Vérifiez ensuite la résolution d’un nom avec nslookup, puis la connectivité vers la passerelle. Distinguez un échec DNS d’un problème de routage.</p>', 30, 1
FROM chapters ch JOIN courses c ON c.id = ch.course_id
WHERE c.code = 'INF-105' AND ch.title = 'Fondamentaux et mise en pratique'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.chapter_id = ch.id AND l.title = 'Adresser et diagnostiquer un réseau IP')
UNION ALL
SELECT ch.id, 1, 'Analyser un problème algorithmique', 'Décomposer un problème et exprimer une solution non ambiguë.', '<h2>De l’énoncé à l’algorithme</h2><p>Identifiez les entrées, les sorties et les contraintes. Décomposez le traitement en étapes simples, puis vérifiez les cas limites : collection vide, valeur minimale, doublons et données inattendues.</p><h3>Exercice</h3><p>Écrivez en pseudocode un algorithme qui recherche la plus grande valeur d’un tableau non vide. Justifiez son résultat et comptez le nombre de comparaisons effectuées pour un tableau de taille n.</p>', 25, 1
FROM chapters ch JOIN courses c ON c.id = ch.course_id
WHERE c.code = 'INF-101' AND ch.title = 'Fondamentaux et mise en pratique'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.chapter_id = ch.id AND l.title = 'Analyser un problème algorithmique')
UNION ALL
SELECT ch.id, 2, 'Choisir une structure de données', 'Comparer tableaux, listes, piles et files selon les opérations.', '<h2>Structures et coûts</h2><p>Le choix d’une structure dépend des opérations dominantes. Un tableau permet un accès direct par indice. Une pile suit LIFO ; une file suit FIFO. Une liste chaînée facilite certaines insertions, mais nécessite un parcours pour accéder à un élément.</p><h3>Application</h3><p>Pour chacun de ces cas — annuler une action, gérer une file d’attente, consulter un élément par numéro — choisissez une structure et expliquez le compromis entre temps d’accès, insertion et mémoire.</p>', 30, 1
FROM chapters ch JOIN courses c ON c.id = ch.course_id
WHERE c.code = 'INF-101' AND ch.title = 'Fondamentaux et mise en pratique'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.chapter_id = ch.id AND l.title = 'Choisir une structure de données')
UNION ALL
SELECT ch.id, 1, 'Types, fonctions et compilation en C++', 'Organiser un programme avec des types explicites et des fonctions.', '<h2>Structure d’un programme</h2><p>Un programme C++ déclare un point d’entrée main, des types et des fonctions. Une fonction reçoit des paramètres, réalise une tâche délimitée et peut retourner une valeur. Le compilateur détecte de nombreuses erreurs avant l’exécution.</p><h3>Exercice</h3><p>Écrivez une fonction qui calcule la moyenne de trois nombres réels. Choisissez un type adapté, nommez clairement les paramètres et testez la fonction avec des valeurs ordinaires et des valeurs négatives.</p>', 25, 1
FROM chapters ch JOIN courses c ON c.id = ch.course_id
WHERE c.code = 'INF-102' AND ch.title = 'Fondamentaux et mise en pratique'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.chapter_id = ch.id AND l.title = 'Types, fonctions et compilation en C++')
UNION ALL
SELECT ch.id, 2, 'Comprendre pointeurs et durée de vie', 'Manipuler les adresses sans perdre le contrôle de la mémoire.', '<h2>Adresses et références</h2><p>Un pointeur contient l’adresse d’un objet. Une référence fournit un autre nom pour un objet existant. Avant de déréférencer un pointeur, vérifiez qu’il désigne une zone valide ; évitez de conserver une adresse après la fin de vie de l’objet.</p><h3>Gestion moderne</h3><p>Privilégiez les objets automatiques et les conteneurs standard. Lorsque la propriété dynamique est nécessaire, les pointeurs intelligents expriment qui possède la ressource et libèrent la mémoire automatiquement.</p>', 30, 1
FROM chapters ch JOIN courses c ON c.id = ch.course_id
WHERE c.code = 'INF-102' AND ch.title = 'Fondamentaux et mise en pratique'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.chapter_id = ch.id AND l.title = 'Comprendre pointeurs et durée de vie')
UNION ALL
SELECT ch.id, 1, 'Concevoir avec UML et des responsabilités claires', 'Passer des besoins aux composants et interactions du logiciel.', '<h2>Modéliser avant de coder</h2><p>Le diagramme de cas d’utilisation présente les acteurs et leurs objectifs. Le diagramme de classes décrit les concepts et leurs relations. Le diagramme de séquence montre l’ordre des échanges nécessaires à un scénario.</p><h3>Exercice</h3><p>Pour une inscription à un cours, identifiez l’acteur, les conditions préalables, le résultat attendu et les objets qui collaborent. Vérifiez que chaque responsabilité est attribuée à un composant cohérent.</p>', 25, 1
FROM chapters ch JOIN courses c ON c.id = ch.course_id
WHERE c.code = 'INF-106' AND ch.title = 'Fondamentaux et mise en pratique'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.chapter_id = ch.id AND l.title = 'Concevoir avec UML et des responsabilités claires')
UNION ALL
SELECT ch.id, 2, 'Développer et tester par petites itérations', 'Planifier, implémenter et vérifier une fonctionnalité progressivement.', '<h2>Itérations et tests</h2><p>Une itération livre une petite amélioration vérifiable. Définissez des critères d’acceptation, implémentez le comportement, puis testez le cas nominal et les erreurs attendues. Les tests unitaires isolent une fonction ou un composant.</p><h3>Pratique</h3><p>Choisissez une règle métier simple, écrivez un test qui décrit le résultat attendu, implémentez la règle et relancez le test. Un échec doit faciliter le diagnostic plutôt que masquer la cause.</p>', 30, 1
FROM chapters ch JOIN courses c ON c.id = ch.course_id
WHERE c.code = 'INF-106' AND ch.title = 'Fondamentaux et mise en pratique'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.chapter_id = ch.id AND l.title = 'Développer et tester par petites itérations')
UNION ALL
SELECT ch.id, 1, 'Processus, threads et ordonnancement', 'Distinguer programme, processus et thread dans un système.', '<h2>Exécution concurrente</h2><p>Un processus possède un espace mémoire isolé. Ses threads partagent certaines ressources et peuvent exécuter des tâches concurrentes. L’ordonnanceur répartit le temps processeur entre les tâches prêtes selon une politique donnée.</p><h3>À observer</h3><p>La concurrence ne garantit pas un ordre fixe. Lorsque plusieurs threads accèdent aux mêmes données, il faut protéger les opérations partagées pour éviter les courses critiques.</p>', 25, 1
FROM chapters ch JOIN courses c ON c.id = ch.course_id
WHERE c.code = 'INF-107' AND ch.title = 'Fondamentaux et mise en pratique'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.chapter_id = ch.id AND l.title = 'Processus, threads et ordonnancement')
UNION ALL
SELECT ch.id, 2, 'Synchroniser les accès aux ressources', 'Comprendre mutex, sémaphores et interblocages.', '<h2>Exclusion mutuelle</h2><p>Un mutex protège une section critique afin qu’un seul thread y accède à la fois. Un sémaphore contrôle l’accès à un nombre limité de ressources. L’ordre de prise des verrous doit rester cohérent.</p><h3>Prévenir les blocages</h3><p>Un interblocage survient lorsque des tâches s’attendent mutuellement. Réduisez le nombre de verrous, documentez leur ordre d’acquisition et libérez toujours les ressources même en cas d’erreur.</p>', 30, 1
FROM chapters ch JOIN courses c ON c.id = ch.course_id
WHERE c.code = 'INF-107' AND ch.title = 'Fondamentaux et mise en pratique'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.chapter_id = ch.id AND l.title = 'Synchroniser les accès aux ressources')
UNION ALL
SELECT ch.id, 1, 'Recueillir et structurer les exigences', 'Décrire les besoins et critères de réussite du système.', '<h2>Exigences vérifiables</h2><p>Une exigence décrit un besoin observable par un utilisateur ou une contrainte du système. Elle doit être compréhensible, testable et traçable jusqu’à une fonction ou un critère d’acceptation.</p><h3>Exercice</h3><p>Transformez « le système doit être rapide » en une exigence mesurable, en précisant l’action, le contexte et un seuil de réponse. Distinguez ensuite les exigences fonctionnelles des exigences de qualité.</p>', 25, 1
FROM chapters ch JOIN courses c ON c.id = ch.course_id
WHERE c.code = 'INF-108' AND ch.title = 'Fondamentaux et mise en pratique'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.chapter_id = ch.id AND l.title = 'Recueillir et structurer les exigences')
UNION ALL
SELECT ch.id, 2, 'Modéliser les scénarios avec des diagrammes', 'Relier cas d’utilisation, séquences et architecture.', '<h2>Scénarios et interactions</h2><p>Un cas d’utilisation décrit un objectif du point de vue d’un acteur. Un diagramme de séquence détaille les messages échangés entre les composants pour atteindre cet objectif.</p><h3>Application</h3><p>Modélisez la connexion d’un utilisateur : saisie des identifiants, vérification serveur, résultat accepté ou refusé. Vérifiez que les erreurs et les permissions sont aussi représentées.</p>', 30, 1
FROM chapters ch JOIN courses c ON c.id = ch.course_id
WHERE c.code = 'INF-108' AND ch.title = 'Fondamentaux et mise en pratique'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.chapter_id = ch.id AND l.title = 'Modéliser les scénarios avec des diagrammes')
UNION ALL
SELECT ch.id, 1, 'Organiser une application avec MVC', 'Séparer présentation, logique applicative et accès aux données.', '<h2>Responsabilités des couches</h2><p>Le modèle porte les données et règles métier, la vue présente le résultat et le contrôleur orchestre les actions entrantes. Cette séparation limite le couplage et facilite les tests et la maintenance.</p><h3>Parcours d’une requête</h3><p>Une route reçoit la demande, valide les paramètres, appelle le service métier, puis retourne une réponse adaptée. Ne placez pas les règles métier dans le gabarit d’affichage.</p>', 25, 1
FROM chapters ch JOIN courses c ON c.id = ch.course_id
WHERE c.code = 'INF-109' AND ch.title = 'Fondamentaux et mise en pratique'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.chapter_id = ch.id AND l.title = 'Organiser une application avec MVC')
UNION ALL
SELECT ch.id, 2, 'Construire une API et valider les entrées', 'Définir des routes cohérentes et des réponses exploitables.', '<h2>Contrat d’API</h2><p>Associez chaque route à une méthode HTTP et à une ressource. Validez les données côté serveur, utilisez des requêtes préparées pour la base et renvoyez un statut HTTP ainsi qu’un JSON cohérents en cas de succès ou d’erreur.</p><h3>Exercice</h3><p>Définissez une route de création de ressource : champs requis, validation, statut de succès, erreurs de validation et conflit de données. Le client ne doit jamais dépendre d’une page HTML inattendue.</p>', 30, 1
FROM chapters ch JOIN courses c ON c.id = ch.course_id
WHERE c.code = 'INF-109' AND ch.title = 'Fondamentaux et mise en pratique'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.chapter_id = ch.id AND l.title = 'Construire une API et valider les entrées')
UNION ALL
SELECT ch.id, 1, 'Protéger les comptes et les mots de passe', 'Appliquer les bases de l’authentification sécurisée.', '<h2>Authentification</h2><p>Ne stockez jamais un mot de passe en clair. Enregistrez un hachage produit par une fonction dédiée, puis vérifiez le mot de passe avec la fonction de vérification correspondante. Limitez les informations révélées lors d’un échec de connexion.</p><h3>Sessions</h3><p>Régénérez l’identifiant de session après authentification, utilisez des cookies HttpOnly et SameSite, et vérifiez les permissions sur chaque action sensible.</p>', 25, 1
FROM chapters ch JOIN courses c ON c.id = ch.course_id
WHERE c.code = 'INF-110' AND ch.title = 'Fondamentaux et mise en pratique'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.chapter_id = ch.id AND l.title = 'Protéger les comptes et les mots de passe')
UNION ALL
SELECT ch.id, 2, 'Réduire les risques dans les applications web', 'Identifier les injections, XSS et requêtes falsifiées.', '<h2>Défenses essentielles</h2><p>Les requêtes préparées séparent les valeurs SQL de la requête. L’encodage contextuel des sorties réduit les risques de scripts injectés. Un jeton CSRF protège les actions d’une session contre les requêtes provenant d’un autre site.</p><h3>Vérification</h3><p>Validez les entrées selon leur type et leur taille, appliquez les contrôles d’accès côté serveur et évitez d’exposer les erreurs internes ou les secrets dans les réponses et journaux.</p>', 30, 1
FROM chapters ch JOIN courses c ON c.id = ch.course_id
WHERE c.code = 'INF-110' AND ch.title = 'Fondamentaux et mise en pratique'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.chapter_id = ch.id AND l.title = 'Réduire les risques dans les applications web');

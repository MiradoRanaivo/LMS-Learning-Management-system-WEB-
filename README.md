# LMS Web

Plateforme de gestion de l’apprentissage destinée aux étudiants, aux enseignants et aux administrateurs.

## Présentation

LMS Web regroupe les outils nécessaires au suivi des activités pédagogiques :

- Consultation des cours et des leçons
- Réalisation des quiz et remise des devoirs
- Suivi des notes et du calendrier
- Accès aux ressources pédagogiques et au forum
- Gestion des utilisateurs et des cours selon le rôle

## Technologies

- **Frontend :** React, TypeScript, Vite et Tailwind CSS
- **Backend :** PHP avec PDO
- **Base de données :** MySQL / MariaDB

## Organisation du projet

- `src/` : application React et composants d’interface
- `api/` : services PHP et endpoints JSON
- `database/` : schéma SQL et données de démonstration
- `scripts/dev-all.mjs` : démarrage local simultané de PHP et Vite
- `pages/`, `css/`, `js/` : ancienne interface HTML, CSS et JavaScript

## Prérequis

- Node.js et npm
- PHP 8 ou version compatible, avec les extensions `pdo_mysql` et `mbstring`
- MySQL ou MariaDB (XAMPP convient)

## Installation

1. Cloner le dépôt.
2. Installer les dépendances frontend :

   ```bash
   npm install
   ```

3. Démarrer MySQL depuis le panneau de contrôle XAMPP.
4. Pour une nouvelle base, créer `lms_db` puis importer `database/schema.sql`. Le fichier contient le schéma courant ; ne lui appliquez pas ensuite les migrations.
5. Pour une base existante, sauvegardez-la d’abord et **n’importez pas** `schema.sql` comme mise à niveau. Vérifiez les colonnes/tables déjà présentes, puis appliquez uniquement les migrations manquantes dans l’ordre : `001_user_preferences.sql`, `002_lesson_resource_management.sql`, `003_assignment_management.sql`, `004_quiz_exam_management.sql`, `005_quiz_manual_grading.sql`, les deux fichiers `006_*.sql`, `007_explicit_grade_publication.sql`, `008_user_notification_preferences.sql`, `009_lesson_publication_compat.sql`. Certaines migrations ne sont pas ré-exécutables : ne les relancez pas si leurs changements sont déjà présents. Ces scripts ne réinitialisent pas la base.
6. Vérifier les paramètres de connexion PHP. Par défaut, `api/db.php` utilise `127.0.0.1:3306`, la base `lms_db`, l’utilisateur `root` et un mot de passe vide. Pour une autre configuration, définir les variables d’environnement `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` et `DB_PASS` dans le terminal qui lance PHP. PHP ne lit pas automatiquement le fichier `.env`.

## Développement local (Windows / XAMPP)

Après avoir démarré **MySQL** dans XAMPP, une seule commande démarre le serveur PHP intégré et Vite :

```powershell
npm run dev:all
```

Le script recherche PHP dans `C:\\xampp\\php\\php.exe` (chemin XAMPP par défaut), puis dans le PATH. Si XAMPP est installé ailleurs, indiquer son chemin avant le lancement :

```powershell
$env:PHP_BIN = "D:\\xampp\\php\\php.exe"
npm run dev:all
```

- Frontend : URL affichée par Vite, généralement `http://localhost:3000`.
- Backend PHP : `http://127.0.0.1:8000`.
- Le proxy Vite transmet `/api/*` et les anciens chemins `/lms/api/*` au backend PHP.
- Arrêter les deux serveurs avec `Ctrl+C`.

Le serveur Apache de XAMPP n’est pas nécessaire pour ce mode de développement : le serveur PHP intégré exécute les endpoints du dossier `api/`. MySQL doit rester démarré dans XAMPP.

Pour lancer uniquement le frontend, utiliser `npm run dev:frontend`, à condition qu’un backend PHP soit déjà disponible sur le port 8000.

## Vérifications

```bash
npm run lint
npm run build
```

## Données de démonstration

Le fichier `database/seed.sql` contient des données de démonstration. Ne pas l’importer dans une base de production.

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
- `pages/`, `css/`, `js/` : ancienne interface HTML, CSS et JavaScript

## Prérequis

- Node.js et npm
- PHP 8 ou version compatible avec le code du projet
- MySQL ou MariaDB
- Un serveur web configuré pour exécuter PHP (Apache, Nginx ou environnement local équivalent)

## Installation

1. Cloner le dépôt.
2. Installer les dépendances frontend :

   ```bash
   npm install
   ```

3. Configurer la connexion à la base de données dans l’environnement PHP avec les variables suivantes :

   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=lms_db
   DB_USER=root
   DB_PASS=
   ```

4. Créer la base de données et importer le schéma disponible dans `database/`.
5. Configurer le serveur web pour que le frontend et le dossier `api/` soient accessibles selon les chemins utilisés par l’application.

## Développement

Lancer le serveur de développement frontend :

```bash
npm run dev
```

Vérifier les types TypeScript :

```bash
npm run lint
```

Créer une version de production :

```bash
npm run build
```

## Remarque

Le fichier `database/seed.sql` contient des données de démonstration. Ne pas l’importer dans une base de production.

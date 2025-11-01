# TaskFlow API Backend

API REST multi-tenant pour la gestion de projets et de tâches développée avec Node.js, Express, TypeScript et Prisma.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- PostgreSQL
- Yarn ou npm

### Installation

1. **Cloner le projet et naviguer vers le backend**
   ```bash
   cd backend
   ```

2. **Installer les dépendances**
   ```bash
   yarn install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   # Modifier les valeurs dans .env selon votre configuration
   ```

4. **Configurer la base de données**
   ```bash
   # Générer le client Prisma
   yarn prisma:generate

   # Exécuter les migrations
   yarn prisma:migrate
   ```

5. **Démarrer le serveur de développement**
   ```bash
   yarn dev
   ```

Le serveur sera accessible sur `http://localhost:5000`

## 📖 Documentation

### Documentation interactive Swagger
Une fois le serveur démarré, accédez à la documentation interactive :
```
http://localhost:5000/api-docs
```

### Documentation complète
Consultez le fichier [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) pour une documentation détaillée.

### Collection Postman
Importez la collection Postman depuis `docs/TaskFlow_API.postman_collection.json` pour tester l'API.

## 🏗️ Architecture

```
src/
├── config/          # Configuration (Swagger, etc.)
├── controllers/     # Contrôleurs des routes
├── lib/            # Utilitaires (Prisma client)
├── middleware/     # Middlewares (auth, tenancy)
├── routes/         # Définition des routes
├── types/          # Types TypeScript
└── server.ts       # Point d'entrée de l'application
```

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification :

1. **Inscription** : `POST /api/auth/register`
2. **Connexion** : `POST /api/auth/login`
3. **Utilisation** : Inclure le token dans l'en-tête `Authorization: Bearer <token>`

## 🏢 Multi-tenancy

L'architecture multi-tenant permet :
- Isolation des données par organisation
- Gestion des rôles et permissions
- Sécurité au niveau des routes

### Rôles disponibles
- **OWNER** : Propriétaire de l'organisation
- **ADMIN** : Administrateur
- **MEMBER** : Membre

## 📊 Base de données

### Modèles principaux
- **User** : Utilisateurs du système
- **Organization** : Organisations/entreprises
- **OrganizationMember** : Relation utilisateur-organisation avec rôle
- **Project** : Projets au sein d'une organisation
- **Task** : Tâches au sein d'un projet

### Commandes Prisma utiles
```bash
# Générer le client
yarn prisma:generate

# Créer une migration
yarn prisma:migrate

# Interface d'administration
yarn prisma:studio

# Reset de la base de données
yarn prisma migrate reset
```

## 🛠️ Scripts disponibles

```bash
# Développement
yarn dev              # Démarrer en mode développement avec hot-reload

# Build
yarn build            # Compiler TypeScript vers JavaScript
yarn start            # Démarrer le serveur de production

# Base de données
yarn prisma:generate  # Générer le client Prisma
yarn prisma:migrate   # Exécuter les migrations
yarn prisma:studio    # Interface d'administration

# Documentation
yarn docs:generate    # Générer la documentation OpenAPI
yarn docs:serve       # Servir la documentation

# Tests
yarn test             # Exécuter les tests
```

## 🌍 Variables d'environnement

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/taskflow"

# Serveur
PORT=5000
NODE_ENV=development
API_URL="http://localhost:5000"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# CORS
CORS_ORIGIN="http://localhost:5173"
```

## 📝 Endpoints principaux

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Organisations
- `POST /api/organizations` - Créer une organisation
- `GET /api/organizations` - Lister mes organisations
- `GET /api/organizations/{id}` - Détails d'une organisation

### Projets
- `POST /api/organizations/{orgId}/projects` - Créer un projet
- `GET /api/organizations/{orgId}/projects` - Lister les projets
- `PATCH /api/organizations/{orgId}/projects/{id}` - Modifier un projet

### Tâches
- `POST /api/organizations/{orgId}/projects/{projId}/tasks` - Créer une tâche
- `GET /api/organizations/{orgId}/projects/{projId}/tasks` - Lister les tâches
- `PATCH /api/organizations/{orgId}/projects/{projId}/tasks/{id}` - Modifier une tâche

## 🔧 Développement

### Structure des réponses
Toutes les réponses suivent le format :
```json
{
  "success": boolean,
  "data": object|array,
  "message": "string",
  "error": "string"
}
```

### Middleware de sécurité
- **Helmet** : Protection des en-têtes HTTP
- **CORS** : Configuration des origines autorisées
- **Rate Limiting** : Limitation du nombre de requêtes
- **JWT Authentication** : Authentification par token
- **Tenant Verification** : Vérification des permissions d'organisation

### Validation des données
Utilisation de **Zod** pour la validation des schémas d'entrée avec messages d'erreur détaillés.

## 🚀 Déploiement

### Build de production
```bash
yarn build
yarn start
```

### Variables d'environnement de production
Assurez-vous de configurer :
- `NODE_ENV=production`
- `JWT_SECRET` avec une clé sécurisée
- `DATABASE_URL` vers votre base de données de production
- `CORS_ORIGIN` vers votre domaine frontend

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
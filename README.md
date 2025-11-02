# TaskFlow - Multi-Tenant Project Management Application


**TaskFlow** is a professional-grade, multi-tenant project management application built with modern web technologies. It enables teams to manage projects and tasks within isolated organizational workspaces, similar to GitHub's organization model.



---

##  Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Multi-Tenancy Implementation](#-multi-tenancy-implementation)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)

---

##  Features

### Core Features
- **Multi-Tenant Architecture**: Complete data isolation per organization
- **User Authentication**: Secure JWT-based authentication
- **Organization Management**: Create and manage multiple organizations
- **Role-Based Access Control (RBAC)**: Owner, Admin, and Member roles
- **Project Management**: Create, update, and archive projects
- **Task Management**: Full CRUD operations with status tracking
- **Team Collaboration**: Invite members and assign tasks
- **Organization Switching**: Seamlessly switch between organizations without logout

### User Experience
- **Responsive Design**: Mobile-first approach using Tailwind CSS
- **Real-time Updates**: React Query for optimistic updates
- **Dark Mode**: Full dark mode support
- **Toast Notifications**: User feedback with Sonner
- **Loading States**: Skeleton loaders for better UX
- **Form Validation**: Client-side validation with Zod

---

##  Technology Stack

### Frontend

| Library/Tool | Version | Purpose | Justification |
|-------------|---------|---------|---------------|
| **React** | 18.2.0 | UI Library | Industry standard, component-based architecture, large ecosystem |
| **TypeScript** | 5.3.3 | Type Safety | Catch errors at compile-time, better IDE support, self-documenting code |
| **Vite** | 5.0.11 | Build Tool | Fast HMR, optimized builds, better DX than CRA |
| **React Router** | 6.21.1 | Routing | Type-safe routing, nested routes, data loading |
| **Zustand** | 4.4.7 | State Management | Minimal boilerplate, no Provider wrapper, easier than Redux |
| **TanStack Query** | 5.17.9 | Server State | Cache management, auto-refetching, optimistic updates |
| **Axios** | 1.6.5 | HTTP Client | Interceptors for auth, better error handling than fetch |
| **React Hook Form** | 7.49.3 | Form Management | Performant, minimal re-renders, great DX |
| **Zod** | 3.22.4 | Schema Validation | Type-safe validation, works with RHF, same schema as backend |
| **Tailwind CSS** | 3.4.1 | Styling | Utility-first, consistent design, fast development |
| **Lucide React** | 0.303.0 | Icons | Modern icons, tree-shakeable, consistent style |
| **date-fns** | 3.0.6 | Date Manipulation | Lightweight, tree-shakeable, better than moment.js |
| **Sonner** | 1.3.1 | Toast Notifications | Beautiful toasts, easy API, accessible |

### Backend

| Library/Tool | Version | Purpose | Justification |
|-------------|---------|---------|---------------|
| **Node.js** | 20+ | Runtime | Async I/O, large ecosystem, JavaScript everywhere |
| **Express** | 4.18.2 | Web Framework | Minimal, flexible, widely adopted |
| **TypeScript** | 5.3.3 | Type Safety | Same benefits as frontend |
| **Prisma** | 5.7.1 | ORM | Type-safe queries, migrations, excellent DX |
| **PostgreSQL** | 15+ | Database | ACID compliant, JSON support, row-level security |
| **bcryptjs** | 2.4.3 | Password Hashing | Industry standard, secure salt rounds |
| **jsonwebtoken** | 9.0.2 | Authentication | Stateless auth, scalable, standard |
| **Zod** | 3.22.4 | Validation | Share validation logic with frontend |
| **Helmet** | 7.1.0 | Security | Security headers, XSS protection |
| **CORS** | 2.8.5 | Cross-Origin | Configure allowed origins |
| **express-rate-limit** | 7.1.5 | Rate Limiting | Prevent abuse, DDoS protection |

### DevOps & Tools

| Tool | Purpose | Justification |
|------|---------|---------------|
| **ESLint** | Code Linting | Catch errors, enforce code style |
| **Prettier** | Code Formatting | Consistent formatting across team |
| **Vitest** | Testing | Fast, Vite-native, Jest-compatible |
| **GitHub Actions** | CI/CD | Automated testing and deployment |
| **Vercel** | Frontend Hosting | Zero-config, edge network, great DX |
| **Railway** | Backend Hosting | Easy PostgreSQL, env management, auto-deploy |

---

## Architecture

### System Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  React Frontend │◄───────►│  Express API     │◄───────►│  PostgreSQL DB  │
│  (Vite)         │  HTTP   │  (Node.js)       │  Prisma │  (Multi-tenant) │
│                 │  REST   │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
       │                             │
       │                             │
       ▼                             ▼
┌─────────────────┐         ┌──────────────────┐
│  React Query    │         │  JWT Auth        │
│  (Caching)      │         │  Middleware      │
└─────────────────┘         └──────────────────┘
```

### Database Schema

```
User ──────┬────────── OrganizationMember ────────── Organization
           │                                                │
           │                                                │
           └─────────────── Project ◄─────────────────────┘
                              │
                              │
                              └────── Task
```

**Key Relationships:**
- A User can belong to multiple Organizations (Many-to-Many via OrganizationMember)
- An Organization has many Projects (One-to-Many)
- A Project has many Tasks (One-to-Many)
- A Task can be assigned to one User (Many-to-One)

### Authentication Flow

```
1. User Registration/Login
   ↓
2. Server generates JWT token
   ↓
3. Token stored in localStorage
   ↓
4. Axios interceptor adds token to all requests
   ↓
5. Server validates token via middleware
   ↓
6. Request proceeds with authenticated user
```

---

##  Multi-Tenancy Implementation

TaskFlow implements **shared database, shared schema** multi-tenancy with **discriminator-based isolation**.

### How It Works

1. **Data Isolation**: All resources (Projects, Tasks) include `organizationId` foreign key
2. **Membership Verification**: Middleware checks if user belongs to organization
3. **Query Filtering**: All queries automatically filter by `organizationId`
4. **Role-Based Access**: Different permissions per organization (Owner > Admin > Member)

### Tenancy Middleware Flow

```typescript
Request → Authentication → Tenancy Verification → Role Check → Controller
         (JWT decode)      (Check membership)     (RBAC)      (Business logic)
```

### Security Measures

- **Row-Level Filtering**: Every query includes `organizationId`
- **Membership Validation**: Cannot access data from organizations user doesn't belong to
- **Role Enforcement**: Actions restricted based on user role
- **No Cross-Tenant Leaks**: Impossible to access other organization's data

### Example: Creating a Task

```typescript
// 1. User authenticated via JWT
// 2. Middleware verifies user belongs to organization
// 3. Middleware attaches organizationId to request
// 4. Controller creates task with organizationId filter
// 5. Query automatically filters by organizationId

const task = await prisma.task.create({
  data: {
    ...taskData,
    project: {
      connect: {
        id: projectId,
        organizationId: req.organization.id // Ensures project belongs to org
      }
    }
  }
});
```

---

##  Getting Started

### Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn**
- **Git**

### Local Development Setup

#### 1. Clone Repository

```bash
git clone https://github.com/devdiop221/taskflow.git
cd taskflow
```

#### 2. Backend Setup

```bash
cd backend
yarn install  # or npm install
```

Create `.env` file in the `backend` directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/taskflow"
PORT=8000
NODE_ENV=development
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
```

Setup database and run migrations:

```bash
# Generate Prisma Client
yarn prisma:generate

# Run migrations
yarn prisma:migrate

# Seed database with test data (optional)
yarn db:seed

# Open Prisma Studio to view/manage data (optional)
yarn prisma:studio
```

Build and start the backend:

```bash
# Development mode with hot reload
yarn dev

# Production build
yarn build

# Start production server
yarn start
```

Backend API runs on `https://taskflow-production-7cfa.up.railway.app`
Swagger documentation available at `https://taskflow-production-7cfa.up.railway.app/api-docs`

#### 3. Frontend Setup

```bash
cd ../frontend
yarn install  # or npm install
```

Create `.env` file in the `frontend` directory:

```env
VITE_API_URL=https://taskflow-production-7cfa.up.railway.app/api
```

Start development server:

```bash
yarn dev
```

Frontend runs on `https://taskflow-ten-kohl.vercel.app`

#### 4. Quick Start Script

To simplify local development, use this script to start both frontend and backend:

```bash
# From taskflow root directory
cd backend && yarn dev &
cd ../frontend && yarn dev
```

Or use the individual terminals:

**Terminal 1 - Backend:**
```bash
cd backend
yarn dev  # Runs on http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
yarn dev  # Runs on http://localhost:5173
```

#### 5. Test Credentials

After seeding the database, use these test accounts:

```
Email: john.doe@example.com
Password: Test1234!
Role: Organization Owner

Email: jane.smith@example.com
Password: Test1234!
Role: Organization Member
```

#### 6. Verify Setup

1. **Backend Health Check**: Visit `https://taskflow-production-7cfa.up.railway.app/api-docs` - you should see Swagger API documentation and Postman collection
2. **Frontend Launch**: Visit `https://taskflow-ten-kohl.vercel.app` - you should see the TaskFlow login page
3. **Test Registration**: Click "S'inscrire" to register a new account
4. **Create Organization**: After login, create your first organization
5. **Create Project**: Add a project and start creating tasks!

### Development Commands Reference

#### Backend Commands

```bash
cd backend

# Development
yarn dev              # Start dev server with hot reload
yarn build            # Compile TypeScript to JavaScript
yarn start            # Run compiled production build

# Database
yarn prisma:generate  # Generate Prisma Client
yarn prisma:migrate   # Run database migrations
yarn prisma:studio    # Open Prisma Studio UI
yarn db:seed          # Seed database with test data

# Testing & Linting
yarn test             # Run tests
yarn docs:generate    # Generate API docs
```

#### Frontend Commands

```bash
cd frontend

# Development
yarn dev              # Start dev server with Vite HMR
yarn build            # Build production bundle
yarn preview          # Preview production build locally
yarn lint             # Run ESLint

# Debugging
yarn dev --debug      # Run with debug logging
```

---



#### Start the Application

```bash
# Clone and navigate to project
git clone https://github.com/devdiop221/taskflow.git
cd taskflow

# Copy environment variables (optional, defaults provided)
cp .env.example .env


```

The application will be available at:
- **Frontend**: https://taskflow-ten-kohl.vercel.app
- **Backend API**: https://taskflow-production-7cfa.up.railway.app
- **API Documentation**: https://taskflow-production-7cfa.up.railway.app/api-docs
- **Postman Collection**: [TaskFlow API.postman_collection.json](backend/docs/TaskFlow%20API.postman_collection.json)
- **Database**: postgresql://taskflow:taskflow_dev@localhost:5432/taskflow

#### Using Makefile Commands

```bash
# View all available commands
make help

# Start services
make up

# View logs
make logs

# Run database migrations
make migrate

# Seed database with test data
make seed

# Stop services
make down

# Check service health
make health

# Open database shell
make shell-db

# Clean up everything
make clean
```




#### Environment Configuration

Edit `.env` to customize settings:

```env
# Database
DB_USER=taskflow
DB_PASSWORD=taskflow_dev
DB_NAME=taskflow

# Backend
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Frontend
VITE_API_URL=http://localhost:5000/api
```


---

##  Deployment

### Frontend Deployment (Vercel)

1. **Push to GitHub**
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Set framework preset: **Vite**
   - Set root directory: `frontend`

3. **Environment Variables**:
   ```
   VITE_API_URL=https://your-api-url.railway.app/api
   ```

4. **Deploy**: Vercel auto-deploys on push to main

### Backend Deployment (Railway)

1. **Prerequisites**:
   - Push your code to GitHub
   - Railway account created at [railway.app](https://railway.app)

2. **Create New Railway Project**:
   ```bash
   # Via Railway CLI (recommended)
   npm install -g @railway/cli
   railway init
   railway link <project-id>
   ```

   Or via Web Dashboard:
   - Click "Create New Project"
   - Select "Deploy from GitHub repo"
   - Authorize GitHub and select `taskflow` repository

3. **Add PostgreSQL Database**:
   - In project dashboard, click "New" button
   - Select "PostgreSQL"
   - Railway automatically creates `DATABASE_URL` environment variable

4. **Configure Build Settings**:
   - Select the code deployment service
   - **Root directory**: `backend`
   - **Build command**: `yarn build`
   - **Start command**: `yarn start`

5. **Set Environment Variables**:
   In Railway dashboard, add these variables:
   ```env
   DATABASE_URL=         # Auto-provided by Railway PostgreSQL
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=<generate-a-secure-random-string>
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

   To generate a secure JWT_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

6. **Deploy**:
   - Railway auto-deploys when you push to main
   - Monitor deployment in Railway dashboard
   - Get your API URL from the Environment tab (format: `https://your-service.railway.app`)

7. **Verify Deployment**:
   ```bash
   # Check API is running
   curl https://your-service.railway.app/api-docs

   # Should return Swagger documentation
   ```

### Frontend Deployment (Vercel)

1. **Prerequisites**:
   - Push your code to GitHub
   - Vercel account at [vercel.com](https://vercel.com)

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select `taskflow` repository
   - Configure:
     - **Framework**: Vite
     - **Root directory**: `frontend`

3. **Environment Variables**:
   ```env
   VITE_API_URL=https://your-backend-railway-url/api
   ```

4. **Deploy**:
   - Vercel auto-deploys on push to main
   - Get your frontend URL from Vercel dashboard



6. **Run Migrations**:
   ```bash
   railway run npx prisma migrate deploy
   ```

7. **Generate Prisma Client**:
   ```bash
   railway run npx prisma generate
   ```

### Alternative Deployment Options

**Frontend:**
- Netlify
- Cloudflare Pages
- AWS Amplify

**Backend:**
- Render
- Fly.io
- Heroku
- AWS EC2 + RDS

---

##  API Documentation

### Base URL

```
https://taskflow-api.railway.app/api
```

### Authentication

All protected endpoints require `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

### Endpoints

#### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user | Yes |

#### Organizations

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| POST | `/organizations` | Create organization | Yes | - |
| GET | `/organizations` | Get user's organizations | Yes | - |
| GET | `/organizations/:id` | Get organization details | Yes | Member+ |
| POST | `/organizations/:id/members` | Invite member | Yes | Admin+ |
| DELETE | `/organizations/:id/members/:userId` | Remove member | Yes | Admin+ |

#### Projects

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| POST | `/organizations/:orgId/projects` | Create project | Yes | Member+ |
| GET | `/organizations/:orgId/projects` | List projects | Yes | Member+ |
| GET | `/organizations/:orgId/projects/:id` | Get project | Yes | Member+ |
| PATCH | `/organizations/:orgId/projects/:id` | Update project | Yes | Member+ |
| DELETE | `/organizations/:orgId/projects/:id` | Delete project | Yes | Admin+ |

#### Tasks

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| POST | `/organizations/:orgId/projects/:projectId/tasks` | Create task | Yes | Member+ |
| GET | `/organizations/:orgId/projects/:projectId/tasks` | List tasks | Yes | Member+ |
| PATCH | `/organizations/:orgId/projects/:projectId/tasks/:id` | Update task | Yes | Member+ |
| DELETE | `/organizations/:orgId/projects/:projectId/tasks/:id` | Delete task | Yes | Member+ |

### Example Requests

#### Register User

```bash
curl -X POST https://taskflow-api.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

#### Create Organization

```bash
curl -X POST https://taskflow-api.railway.app/api/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "name": "Acme Corp",
    "slug": "acme-corp"
  }'
```

#### Create Project

```bash
curl -X POST https://taskflow-api.railway.app/api/organizations/:orgId/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "name": "Website Redesign",
    "description": "Complete redesign of company website"
  }'
```

---



---

##  Project Structure

```
taskflow/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── controllers/           # Route controllers
│   │   ├── middleware/            # Auth & tenancy middleware
│   │   ├── routes/                # API routes
│   │   ├── lib/                   # Prisma client
│   │   ├── types/                 # TypeScript types
│   │   └── server.ts              # Express server
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                # Reusable UI components
│   │   │   ├── layout/            # Layout components
│   │   │   └── features/          # Feature-specific components
│   │   ├── pages/                 # Page components
│   │   ├── lib/
│   │   │   ├── api.ts             # Axios instance
│   │   │   └── utils.ts           # Utility functions
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── store/                 # Zustand stores
│   │   ├── types/                 # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── README.md                      # This file
```

---

##  Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- **TypeScript**: Use strict mode
- **ESLint**: No warnings allowed
- **Prettier**: Auto-format before commit
- **Commits**: Follow conventional commits
- **Tests**: Write tests for new features

---

##  License

This project is licensed under the MIT License.

---

##  Authors

- **Mouhamed Diop**

---

##  Acknowledgments

- Inspired by GitHub's organization model
- Built with modern React and Node.js best practices
- Special thanks to the open-source community

---

##  Contact

For questions or support:
- Email: contact@taskflow.app
- GitHub Issues: [Create an issue](https://github.com/yourusername/taskflow/issues)

---

**Made with ❤️ by Mouhamed Diop**
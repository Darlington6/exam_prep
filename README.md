# Exam Prep

> A web-based platform helping African students excel in their examinations through interactive practice and instant feedback

## African Context

Many students across Africa prepare for important national examinations at the end of secondary school and for university entrance exams. These exams are highly competitive and play a major role in determining students' academic and career opportunities.

However, access to structured and interactive revision materials remains limited in many areas. Students often depend on printed past questions, textbooks, or informal study groups. In some communities, access to quality digital learning platforms is still developing. As a result, many learners do not receive instant feedback on their performance and cannot easily track their progress over time.

This project aims to provide a simple, affordable, and accessible online platform where students can practice exam questions, receive immediate results, and monitor their improvement. By supporting digital learning and self-assessment, the platform helps improve exam preparation and educational outcomes across African countries.

## Team Members

- UWIMANA Chantal - Frontend, DevOps - 755990021
- Desmond Tunyinko - Backend, DevOps - 297697450
- Nmesoma Solomon Peter - Backend, DevOps - 764925507
- Sharangabo Edouard - Frontend, DevOps - [Student ID]

## Project Overview

Exam Prep is a full-stack MERN (MongoDB, Express, React, Node.js) web application that allows students to practice exam questions online. Users can register, log in securely with JWT authentication, choose exam categories, attempt multiple-choice questions, and receive instant results with detailed feedback.

The system automatically calculates scores and shows correct answers with explanations. Students can also view their past attempts and monitor their improvement over time through personalized dashboards.

The platform includes an admin section where administrators can create exams, add questions, and manage content easily. The system is designed to be scalable, secure, and easy to maintain using modern development and DevOps practices, including GitHub Actions and Docker containerization.

### Target Users

Secondary school students

University students

People preparing for professional certification exams

Schools and training centers

### Core Features

- **User Registration and Authentication**: Secure account creation and login with JWT tokens and bcrypt password hashing

- **Practice Exams**: Users can choose from various exam categories and answer multiple-choice questions for any type of exam
- **Timed Practice Sessions**: Test yourself within specific time limits to simulate real exam conditions
- **Instant Results and Feedback**: Immediate scoring with correct answers and detailed explanations after submission
- **Performance Tracking**: View previous attempts and monitor improvement over time through personalized dashboards
- **Admin Dashboard**: Administrators can create and manage exams, add questions manually or fetch from external platforms via API integration
- **API Integration**: Fetch exam questions and content from external educational platforms and APIs to expand the question bank
- **Protected Routes**: Role-based access control for students and administrators
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices

## Technology Stack

| Layer        | Technology                                                        |
| ------------ | ----------------------------------------------------------------- |
| **Frontend** | React 19, TypeScript, Vite 7, React Router 7, Axios               |
| **Backend**  | Node.js 24, Express 4, Mongoose 9                                 |
| **Database** | MongoDB 6 (Docker) / MongoDB Atlas (production)                   |
| **Auth**     | JWT (jsonwebtoken), bcryptjs, role-based access (student / admin) |
| **Testing**  | Jest 30, Supertest, MongoMemoryServer                             |
| **DevOps**   | Docker, Docker Compose, GitHub Actions CI                         |
| **Linting**  | ESLint 9, typescript-eslint                                       |

## Getting Started

### Prerequisites

**Docker setup (recommended):**

- Docker ≥ 20.10
- Docker Compose ≥ 2.0
- Git

**Manual setup:**

- Node.js ≥ 24
- npm ≥ 10
- MongoDB ≥ 6 (local) or a MongoDB Atlas account
- Git

---

### Quick Start with Docker Compose (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/Darlington6/exam_prep.git
   cd exam_prep
   ```

2. **Create the backend environment file**

   ```bash
   cp backend/.env.example backend/.env
   ```

   Then edit `backend/.env`:

   ```dotenv
   PORT=5001
   MONGO_URI=mongodb://mongo:27017/exam_prep_db
   JWT_SECRET=your-super-secret-key-change-in-production
   JWT_EXPIRES_IN=7d
   ```

   > **Note:** When running with Docker Compose the MongoDB host must be `mongo` (the service name), not `localhost`.

3. **Start all services**

   ```bash
   docker-compose up --build
   ```

   This will:
   - Build the backend (Node.js) and frontend (Nginx) Docker images
   - Start a MongoDB 6 container with a persistent volume
   - Start the backend API on **port 5001**
   - Start the frontend on **port 3000**
   - Wire networking between all services automatically

4. **Access the application**
   | Service | URL |
   |---------|-----|
   | Frontend | http://localhost:3000 |
   | Backend API | http://localhost:5001 |
   | MongoDB | localhost:27017 |

5. **Stop services**
   ```bash
   docker-compose down        # stop containers, keep data
   docker-compose down -v     # stop containers and delete database volume
   ```

---

### Manual Installation (Alternative)

1. **Clone the repository**

   ```bash
   git clone https://github.com/Darlington6/exam_prep.git
   cd exam_prep
   ```

2. **Backend**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```

   Edit `backend/.env`:

   ```dotenv
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/exam_prep_db
   JWT_SECRET=your-super-secret-key-change-in-production
   JWT_EXPIRES_IN=7d
   ```

3. **Frontend**

   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   ```

   Edit `frontend/.env`:

   ```dotenv
   VITE_API_URL=http://localhost:5001
   ```

4. **Run the application** (in separate terminals)

   ```bash
   # Terminal 1 — start MongoDB (if local)
   mongod

   # Terminal 2 — backend
   cd backend
   npm run dev or node server.js

   # Terminal 3 — frontend
   cd frontend
   npm run dev
   ```

5. **Access the application**
   | Service | URL |
   |---------|-----|
   | Frontend (Vite dev server) | http://localhost:5173 |
   | Backend API | http://localhost:5001 |

---

### Creating an Admin User

1. Register a regular account through the app.
2. Promote the account to admin:
   ```bash
   cd backend
   node scripts/make-admin.js your-email@example.com
   ```
3. Refresh your browser page or log out and log back in so the new JWT includes the `admin` role.

---

## Running Tests

### Backend Tests

The backend has **40 test cases** across three test suites using Jest and an in-memory MongoDB instance (no external database required):

```bash
cd backend
npm test
```

| Suite        | Tests | Coverage                                           |
| ------------ | ----- | -------------------------------------------------- |
| Auth routes  | 11    | Register, login, token validation                  |
| Exam routes  | 15    | Browse, take exams, auto-grading, attempts         |
| Admin routes | 13    | CRUD exams/questions, authorization, toggle active |

### Frontend Lint

```bash
cd frontend
npm run lint
```

---

## Dockerization

### Backend Dockerfile (`backend/Dockerfile`)

- **Base image:** `node:24-alpine`
- Installs production dependencies only (`--omit=dev`)
- Runs as a non-root user for security
- Exposes port **5001**

### Frontend Dockerfile (`frontend/Dockerfile`)

- **Multi-stage build:**
  - _Stage 1 (builder):_ `node:24-alpine` — installs dependencies, runs `npm run build`
  - _Stage 2 (production):_ `nginx:alpine` — serves the built static files
- Exposes port **80**

### Docker Compose (`docker-compose.yml`)

Orchestrates three services:

| Service    | Image                   | Port      |
| ---------- | ----------------------- | --------- |
| `backend`  | Built from `./backend`  | 5001      |
| `frontend` | Built from `./frontend` | 3000 -> 80|
| `mongo`    | `mongo:6`               | 27017     |

A named volume `mongo-data` provides persistent database storage.

---

## CI/CD Pipeline

The project uses **GitHub Actions** for continuous integration (`.github/workflows/ci.yml`).

### Trigger Conditions

- **Push** to any branch except `main`
- **Pull request** targeting `main`
- **Manual dispatch** via the Actions tab

### Pipeline Steps

| Step                            | Description                                |
| ------------------------------- | ------------------------------------------ |
| Checkout repository             | `actions/checkout@v3`                      |
| Setup Node 24                   | `actions/setup-node@v3`                    |
| Install backend dependencies    | `npm install`                              |
| **Run backend tests**           | `npm test` (Jest + MongoMemoryServer)      |
| Install frontend dependencies   | `npm install`                              |
| **Run frontend lint**           | `npm run lint` (ESLint)                    |
| **Build frontend**              | `npm run build` (TypeScript + Vite)        |
| **Build backend Docker image**  | `docker build -t exam_backend ./backend`   |
| **Build frontend Docker image** | `docker build -t exam_frontend ./frontend` |

All checks must pass before a pull request can be merged to `main`.

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint    | Description              | Auth |
| ------ | ----------- | ------------------------ | ---- |
| POST   | `/register` | Create a new account     | No   |
| POST   | `/login`    | Login and receive JWT    | No   |
| GET    | `/me`       | Get current user profile | Yes  |

### Student Exams (`/api/exams`)

| Method | Endpoint              | Description                    | Auth |
| ------ | --------------------- | ------------------------------ | ---- |
| GET    | `/category/:category` | List active exams by category  | Yes  |
| GET    | `/:id`                | Get a single exam              | Yes  |
| GET    | `/:examId/questions`  | Get questions (answers hidden) | Yes  |
| POST   | `/:examId/submit`     | Submit answers and get graded  | Yes  |
| GET    | `/attempts`           | Get current user's attempts    | Yes  |

### Admin (`/api/admin`) — requires admin role

| Method | Endpoint                   | Description                         |
| ------ | -------------------------- | ----------------------------------- |
| GET    | `/exams`                   | List all exams (including inactive) |
| GET    | `/exams/:id`               | Get a single exam                   |
| POST   | `/exams`                   | Create an exam                      |
| PUT    | `/exams/:id`               | Update an exam                      |
| DELETE | `/exams/:id`               | Delete exam and its questions       |
| PATCH  | `/exams/:id/toggle-active` | Toggle exam active status           |
| GET    | `/exams/:examId/questions` | List questions for an exam          |
| GET    | `/questions/:id`           | Get a single question               |
| POST   | `/questions`               | Create a question                   |
| PUT    | `/questions/:id`           | Update a question                   |
| DELETE | `/questions/:id`           | Delete a question                   |
| POST   | `/external/fetch`          | Fetch exams from external API       |

---

## Project Structure

```
exam_prep/
├── .github/
│   ├── CODEOWNERS                  # Code ownership rules
│   ├── pull_request_template.md    # PR template
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug-report.yml
│   │   ├── config.yml
│   │   ├── devops.yml
│   │   ├── epic.yml
│   │   ├── spike.yml
│   │   ├── task.yml
│   │   └── user-story.yml
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI pipeline
│
├── backend/
│   ├── .dockerignore
│   ├── .env.example                # Environment variables template
│   ├── Dockerfile                  # Backend container (Node 24 Alpine)
│   ├── package.json
│   ├── server.js                   # Express app entry point
│   ├── __tests__/
│   │   ├── setup.js                # MongoMemoryServer test setup
│   │   ├── auth.test.js            # Auth route tests (11 cases)
│   │   ├── exams.test.js           # Student exam route tests (15 cases)
│   │   ├── admin.test.js           # Admin route tests (13 cases)
│   │   └── sample.test.js          # Smoke test
│   ├── middleware/
│   │   ├── auth.js                 # JWT authentication middleware
│   │   └── admin.js                # Admin role authorization middleware
│   ├── models/
│   │   ├── User.js                 # User schema (name, email, password, role)
│   │   ├── Exam.js                 # Exam schema (title, category, difficulty, duration)
│   │   ├── Question.js             # Question schema (options, correct answer, explanation)
│   │   └── ExamAttempt.js          # Attempt schema (score, answers, passed)
│   ├── routes/
│   │   ├── auth.js                 # Register, login, profile routes
│   │   ├── exams.js                # Student exam routes (browse, take, submit)
│   │   └── admin.js                # Admin CRUD routes (exams, questions, external fetch)
│   └── scripts/
│       └── make-admin.js           # CLI utility to promote a user to admin
│
├── frontend/
│   ├── .dockerignore
│   ├── .env.example                # Environment variables template
│   ├── .gitignore
│   ├── Dockerfile                  # Multi-stage build (Node → Nginx)
│   ├── index.html                  # HTML entry point
│   ├── package.json
│   ├── vite.config.ts              # Vite configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── eslint.config.js            # ESLint configuration
│   ├── public/
│   │   └── vite.svg
│   └── src/
│       ├── main.tsx                # React entry point
│       ├── App.tsx                 # Root component with routing
│       ├── App.css
│       ├── index.css
│       ├── api/
│       │   └── client.ts           # Axios API client with auth interceptors
│       ├── assets/
│       │   └── react.svg
│       ├── components/
│       │   ├── ProtectedRoute.tsx   # Auth-guarded route wrapper
│       │   └── admin/
│       │       ├── ExamForm.tsx     # Create/edit exam form
│       │       ├── ExamList.tsx     # Admin exam listing
│       │       ├── ExternalAPIFetch.tsx  # Fetch exams from external APIs
│       │       ├── QuestionForm.tsx # Create/edit question form
│       │       └── QuestionManager.tsx  # Question CRUD manager
│       ├── contexts/
│       │   ├── AuthContext.tsx      # Auth provider (login, register, logout, state)
│       │   └── useAuth.ts          # useAuth hook
│       ├── pages/
│       │   ├── Home.tsx            # Landing page with navigation
│       │   ├── Login.tsx           # Login page
│       │   ├── Register.tsx        # Registration page
│       │   ├── Dashboard.tsx       # Student dashboard
│       │   ├── ExamCategories.tsx  # Browse exam categories
│       │   ├── ExamSelection.tsx   # Select an exam within a category
│       │   ├── ExamTaking.tsx      # Take an exam (timed)
│       │   ├── ExamResults.tsx     # View exam results
│       │   └── AdminDashboard.tsx  # Admin panel
│       └── styles/
│           ├── AdminDashboard.css
│           ├── Dashboard.css
│           ├── ExamCategories.css
│           ├── ExamForm.css
│           ├── ExamList.css
│           ├── ExamResults.css
│           ├── ExamSelection.css
│           ├── ExamTaking.css
│           ├── ExternalAPIFetch.css
│           ├── QuestionForm.css
│           └── QuestionManager.css
│
├── docker-compose.yml              # Orchestrates backend, frontend, MongoDB
├── .gitignore
├── LICENSE
└── README.md
```

## License

MIT License

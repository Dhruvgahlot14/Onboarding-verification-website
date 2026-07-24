# Employee Onboarding & Document Verification Portal

Week 1 deliverable: project setup, JWT authentication, role-based protected routes, and HR employee management.

## Tech Stack

| Layer    | Stack                                              |
|----------|----------------------------------------------------|
| Frontend | React 19, Vite, Tailwind CSS, React Router, Axios |
| Backend  | Node.js, Express, Mongoose, JWT, bcrypt            |
| Database | MongoDB Atlas                                      |

## Project Structure

```
NextGen/
├── client/          # React frontend (Vite)
├── server/          # Express API
├── postman/         # Postman collection
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)
- Postman (optional, for API testing)

## Setup

### 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user and allow network access (0.0.0.0/0 for dev).
3. Copy your connection string.

### 2. Backend

```bash
cd server
cp .env.example .env
# Edit .env with your MONGODB_URI and JWT_SECRET

npm install
npm run seed    # Creates 3 test users
npm run dev     # Starts on http://localhost:5000
```

### 3. Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev     # Starts on http://localhost:5173
```

## Test Credentials (after seed)

| Role       | Email                   | Password     |
|------------|-------------------------|--------------|
| HR Admin   | hr.admin@company.com    | admin123     |
| Manager    | manager@company.com     | manager123   |
| Employee   | employee@company.com    | employee123  |

## API Endpoints

### Auth
| Method | Endpoint            | Access  |
|--------|---------------------|---------|
| POST   | /api/auth/register  | Public  |
| POST   | /api/auth/login     | Public  |

### Employees (HR Admin only)
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| POST   | /api/employees        | Create employee          |
| GET    | /api/employees        | List active employees    |
| GET    | /api/employees/:id    | Get single employee      |
| PUT    | /api/employees/:id    | Update employee          |

### Profile
| Method | Endpoint          | Access        |
|--------|-------------------|---------------|
| GET    | /api/profile/me   | Authenticated |

## Role-Based Routing

| Role       | Login redirect    | Sidebar links                          |
|------------|-------------------|----------------------------------------|
| Employee   | /dashboard        | Attendance, Leave, Profile             |
| Manager    | /manager          | Team, Leave Approvals, Profile         |
| HR Admin   | /admin            | Employees, Reports, Dashboard, Profile |

## Postman

Import `postman/Onboarding-Portal.postman_collection.json`. Run **Login (HR Admin)** first — it auto-saves the JWT to the `token` collection variable.

## Week 1 Acceptance Criteria

- [x] `client/` and `server/` folder structure
- [x] 4 Mongoose models: User, Attendance, LeaveRequest, LeaveBalance
- [x] Auth: register + login with bcrypt + JWT
- [x] Seed data: HR Admin, Manager, Employee
- [x] Login UI with loading/error states
- [x] JWT stored in localStorage, role-based redirect
- [x] ProtectedRoute component
- [x] Role-aware Sidebar shell
- [x] Employee CRUD API (HR Admin)
- [x] Employee Directory with search + Add/Edit modals
- [x] Employee Profile page
- [x] Postman collection

## Out of Scope (Week 1)

Attendance check-in/out, leave workflow, dashboards/KPIs, reports, deployment.

# Employee Onboarding & Document Verification Portal

A full-stack Human Resources Management System (HRMS) built on the MERN stack, encompassing role-based authentication, employee management, attendance tracking, leave workflows, and HR reporting.

## Tech Stack

| Layer    | Stack                                              |
|----------|----------------------------------------------------|
| Frontend | React 19, Vite, Tailwind CSS, React Router, Axios |
| Backend  | Node.js, Express, Mongoose, JWT, bcrypt            |
| Database | MongoDB Atlas                                      |

## Screenshots

| Login / Auth | Employee Dashboard |
|---|---|
| ![Login](client/public/login.png) | ![Employee Dashboard](client/public/employee-dashboard.png) |

| Attendance Check-in | Leave Management |
|---|---|
| ![Attendance](client/public/attendance.png) | ![Leave Management](client/public/leave.png) |

| Admin Directory | Dark Mode |
|---|---|
| ![Admin Directory](client/public/directory.png) | ![Dark Mode](client/public/darkmode.png) |

## Project Structure

```
NextGen/
├── client/          # React frontend (Vite)
├── server/          # Express API
├── postman/         # Postman collection
├── ERD_Diagram.md   # Entity Relationship Diagram
├── Project_Report.md# Final Project Report
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)

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
npm run dev     # Starts on http://localhost:5001
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

### Attendance
| Method | Endpoint                  | Access        | Description              |
|--------|---------------------------|---------------|--------------------------|
| POST   | /api/attendance/checkin   | Authenticated | Check in for today       |
| POST   | /api/attendance/checkout  | Authenticated | Check out, calculate hrs |
| GET    | /api/attendance/mine      | Authenticated | Get own history          |
| GET    | /api/attendance/all       | HR Admin      | Get company attendance   |

### Leave Management
| Method | Endpoint                  | Access        | Description              |
|--------|---------------------------|---------------|--------------------------|
| GET    | /api/leaves/mine          | Authenticated | Get own leave balance/req|
| POST   | /api/leaves/apply         | Authenticated | Apply for leave          |
| GET    | /api/leaves/pending       | Mgr/Admin     | Get pending leaves       |
| PUT    | /api/leaves/:id/status    | Mgr/Admin     | Approve/Reject leave     |
| GET    | /api/leaves/all           | HR Admin      | Get all company leaves   |

## Role-Based Routing

| Role       | Login redirect    | Sidebar links                          |
|------------|-------------------|----------------------------------------|
| Employee   | /dashboard        | Attendance, Leave, Profile             |
| Manager    | /manager          | Team, Leave Approvals, Profile         |
| HR Admin   | /admin            | Employees, Reports, Dashboard, Profile |

## Final Project Acceptance Criteria (Weeks 1-4)

- [x] **Week 1:** Mongoose models (User, Attendance, LeaveRequest, LeaveBalance)
- [x] **Week 1:** Authentication (JWT + bcrypt) and Role-based Protected Routes
- [x] **Week 1:** Employee Directory CRUD operations with Search
- [x] **Week 2:** Attendance API (One-per-day enforcement, Check-out hours calculation)
- [x] **Week 2:** Attendance Check-in UI and History Tables
- [x] **Week 2:** Role-specific Dashboards with live KPIs
- [x] **Week 3:** Auto-create Leave Balances upon Employee Creation
- [x] **Week 3:** Leave Application API (Balance deduction validation)
- [x] **Week 3:** Manager Leave Approval Panel
- [x] **Week 4:** UI Polish (Tailwind responsiveness, loading spinners, toast notifications)
- [x] **Week 4:** HR Reports Module (Leave summary table, CSV Export for Attendance)
- [x] **Week 4:** Project Documentation (README, ERD Diagram, Project Report)

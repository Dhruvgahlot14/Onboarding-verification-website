# Project Report: NextGen HRMS (Employee Onboarding & Verification Portal)

## 1. Executive Summary
The NextGen HRMS is a comprehensive, full-stack Human Resources Management System designed to centralize and automate core HR workflows. Built using the modern MERN stack (MongoDB, Express, React, Node.js), the application provides a secure, role-based platform for managing employee records, tracking daily attendance, and handling leave requests. The system replaces disjointed spreadsheets and manual tracking with an intuitive, responsive web portal that features real-time dashboards, automated reporting, and a seamless user experience.

## 2. Problem Statement & Objectives
### The Problem
Traditional HR processes often rely on scattered spreadsheets, paper trails, and emails to manage onboarding, attendance, and leave requests. This manual approach leads to:
- **Data Inconsistencies:** Errors in tracking hours worked or available leave balances.
- **Lack of Transparency:** Employees lack visibility into their own attendance records or leave approval status.
- **Administrative Overhead:** HR teams spend excessive time compiling reports and manually verifying data.

### Project Objectives
- **Centralize Data:** Create a single source of truth for all employee records and HR processes.
- **Automate Workflows:** Automate attendance hour calculations and leave balance deductions.
- **Enhance Security:** Implement robust authentication and strict Role-Based Access Control (RBAC).
- **Improve User Experience:** Deliver a responsive, accessible, and visually appealing interface that works across desktop and mobile devices.

## 3. System Architecture & Technology Stack
The application was developed using a decoupled client-server architecture.

### Frontend (Client)
- **Framework:** React 19 built with Vite for optimal performance and fast HMR.
- **Styling:** Tailwind CSS v4 for rapid, utility-first UI development, including a site-wide dark mode implementation.
- **Routing:** React Router v7 for seamless Client-Side Routing (CSR).
- **State & HTTP:** React hooks for local state and Axios for RESTful API communication.

### Backend (Server)
- **Runtime:** Node.js with the Express.js framework for creating the REST API.
- **Database:** MongoDB hosted on MongoDB Atlas, utilizing Mongoose ODM for strict schema validation.
- **Authentication:** JSON Web Tokens (JWT) for secure, stateless session management. Password hashing handled by bcrypt.

## 4. Key Features & Implementation
The system is divided into three distinct roles: **Employee**, **Manager**, and **HR Admin**, each with tailored capabilities.

### 4.1 Role-Based Access Control (RBAC)
- **Employees:** Can view their own dashboards, log daily attendance, and submit leave requests.
- **Managers:** Inherit Employee rights but also have access to a "Team Overview" dashboard to approve or reject leave requests from their subordinates.
- **HR Admins:** Have full system access. They can create new employee accounts, manage the global employee directory, and access organization-wide reports.

### 4.2 Attendance Tracking Module
- **Check-in / Check-out:** Employees log their daily start and end times. The system enforces a strict "one check-in per day" rule.
- **Automated Calculations:** Upon check-out, the server automatically calculates the total hours worked.
- **Status Assignment:** Based on hours worked, the system dynamically assigns statuses (`present`, `half_day`, or `absent`).

### 4.3 Leave Management Module
- **Automated Balances:** When an HR Admin creates an employee, a `LeaveBalance` record is automatically seeded with default allowances (Annual, Sick, Casual).
- **Application Workflow:** Employees apply for leave; the system validates that they have sufficient balance before allowing submission.
- **Approval & Deduction:** Managers approve requests. Upon approval, the employee's `LeaveBalance` is automatically deducted.

### 4.4 Dashboards & Reporting
- **Dynamic Dashboards:** Each role has a specialized dashboard presenting key performance indicators (KPIs) like Total Attendance, Average Clock-in time, and Leave Balances.
- **Data Export:** Users can download their information as text files, and export attendance history as CSV format for external processing.

## 5. Challenges Faced & Solutions
1. **Timezone & Date Normalization:** Tracking daily attendance reliably requires ignoring time elements when checking if a user has already checked in "today". 
   *Solution:* We implemented utility functions to normalize all timestamps to midnight UTC before querying the MongoDB collections.
2. **Asynchronous Balance Deduction:** Ensuring that an employee's leave balance doesn't drop below zero if multiple requests are approved concurrently.
   *Solution:* Mongoose validations combined with strict backend checks during the approval route ensure data integrity.
3. **Responsive Dark Mode:** Implementing a robust dark mode that overrides default browser themes.
   *Solution:* Migrated to Tailwind v4 and utilized the `@custom-variant dark` feature, pairing it with a `localStorage` persist handler in the global Layout component.

## 6. Conclusion
The NextGen HRMS successfully achieves its goal of modernizing HR operations. By utilizing the robust MERN stack, the application is scalable, secure, and highly performant. The automated workflows drastically reduce administrative burden, while the sleek, responsive UI (enhanced with dark mode) provides a premium experience for employees and management alike. Future enhancements could include integrating WebSockets for real-time notifications and an automated payroll generation module.

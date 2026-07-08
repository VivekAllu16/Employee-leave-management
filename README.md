# Employee Leave Management System

A robust, corporate-grade Employee Leave Management system built with a **Java Spring Boot REST API** backend, **JPA/MySQL persistence**, and a responsive **React (Vite) frontend** using a clean light-mode sky-blue design system.

---

## 🛠️ Tech Stack

- **Backend**: Java 17, Spring Boot 3.3.0, Spring Data JPA, Hibernate, MySQL 8.4
- **Frontend**: React (Vite), HTML5, Vanilla CSS (Clean Sky-Blue & White Theme)
- **Build / Run Tools**: Apache Maven 3.9.6 (embedded), Node.js / npm
- **Database**: Local MySQL (portable, self-contained within project workspace)

---

## ✨ Features

- **Employee Management**: Add new employees, view profiles, and monitor real-time leave balances. Enforces unique email verification.
- **Leave Request State Machine**:
  - Apply for leaves with automated, real-time duration calculator (inclusive start/end ranges).
  - Progress request states: `PENDING` ➔ `APPROVED`, `REJECTED`, or `CANCELLED`.
  - Automatically deducts leave days from the employee's active balance *only* upon request approval.
  - Validates sequence (start date must precede end date) and remaining balance.
- **Centralized Exception Handling**: Provides uniform REST JSON error payloads for resource missing (404), validation errors (400), and business conflicts.
- **Lifecycle Scripts**: One-click scripts to initialize, start, and stop the entire database and server stack.

---

## 📁 Repository Structure

```
├── backend/                  # Spring Boot project folder
│   ├── src/main/java         # Controllers, Entities, DTOs, Exceptions, Services
│   ├── src/main/resources    # application.properties (JPA & Database configs)
│   └── pom.xml               # Maven configuration & dependencies
├── frontend/                 # React & Vite client folder
│   ├── src/components        # Dashboard, EmployeeList, LeaveRequestList, LeaveApplyModal
│   ├── src/App.jsx           # Main controller, state, and API bindings
│   └── src/index.css         # Styling system (clean white background & sky-blue accents)
├── start-db.bat              # Starts self-contained local MySQL database
├── stop-db.bat               # Shuts down local MySQL database
├── start-project.bat         # Boots up Database, Backend, and Frontend stack in one click
├── stop-project.bat          # Shuts down all running Java, Node, and database processes
└── verify-api.ps1            # PowerShell script to test backend API rules & logic
```

---

## 🚀 How to Run the Project

### Prerequisites
- [Java 17 JDK](https://adoptium.net/temurin/releases/?version=17) or higher installed.
- [Node.js](https://nodejs.org/) (includes `npm`) installed.

### 1. Launch the Stack
Double-click `start-project.bat` or run the following in your shell:
```powershell
.\start-project.bat
```
This script will:
- Check if port `3306` is open; if not, it automatically runs the self-contained MySQL database.
- Launch the Spring Boot backend (`http://localhost:8080`).
- Start the React Vite frontend development server (`http://localhost:5173`).

### 2. Run API Integration Verification
To verify that all database persistence and business rules (validation, balance check, unique emails, cancellations) work correctly, execute:
```powershell
powershell -File verify-api.ps1
```

### 3. Stop the Stack
When finished, double-click `stop-project.bat` or run:
```powershell
.\stop-project.bat
```
This terminates all running database instance, Java, and Node processes.

---

## 📡 REST API Reference

### Employees
* `POST /api/employees` - Register a new employee
* `GET /api/employees` - Retrieve all employees
* `GET /api/employees/{id}` - Get detailed profile by ID
* `GET /api/employees/{id}/leave-balance` - Retrieve remaining leave balance

### Leave Requests
* `POST /api/leaves/employee/{id}` - Submit a leave request
* `GET /api/leaves` - Audit all leave requests
* `GET /api/leaves/employee/{id}` - List requests submitted by a specific employee
* `PUT /api/leaves/{id}/status` - Process leave request status (`APPROVED` / `REJECTED`)
* `PUT /api/leaves/{id}/cancel` - Cancel a leave request

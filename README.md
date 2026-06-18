# Task Manager

A full-stack Task Manager web application developed as a technical assessment for a Fullstack Developer position.

## Overview

The application allows authenticated users to manage personal tasks through a modern web interface and a RESTful API.

Each task contains:

* ID
* Title
* Description
* Status
* Creation date
* Last update date

Supported task states:

* `todo`
* `in_progress`
* `done`

The project was built using:

* Next.js
* React
* TypeScript
* SQLite
* better-sqlite3

---

## Features

### Authentication

* User registration
* User login
* User logout
* Password change
* Session management using HTTP-only cookies
* Persistent server-side sessions stored in SQLite

### Task Management

* Create tasks
* View task list
* View single task
* Update task
* Delete task
* Change task status
* Filter tasks by status

### Validation

Domain-level validation is implemented for:

* User registration
* User authentication
* Password updates
* Task creation
* Task updates
* Status transitions

Invalid requests return appropriate HTTP status codes and descriptive error messages.

---

## Architecture

The project follows a layered architecture with clear separation of responsibilities.

### Domain Layer

Business logic is encapsulated inside domain models:

* User
* Task
* TasksSet
* Session

Examples:

```ts
user.changePassword(...)
task.changeStatus(...)
task.updateTitle(...)
```

API routes never manipulate entity state directly.

### Repository Layer

Persistence is handled through dedicated repositories:

* UserRepository
* TaskRepository
* SessionRepository

Repositories are the only components allowed to communicate directly with SQLite.

### API Layer

API endpoints are implemented using Next.js Route Handlers.

Responsibilities:

* Request parsing
* Authentication checks
* Minimal input validation
* HTTP status management
* JSON responses

Business logic remains inside domain entities.

---

## Database

The application uses SQLite through better-sqlite3.

Tables:

### users

Stores user accounts and credentials.

### tasks

Stores user-owned tasks.

### sessions

Stores active authentication sessions.

Foreign keys are enabled and task/session records are automatically removed when a user is deleted.

---

## REST API

### Authentication

| Method | Endpoint           |
| ------ | ------------------ |
| POST   | /api/auth/register |
| POST   | /api/auth/login    |
| GET    | /api/auth/me       |
| POST   | /api/auth/logout   |
| PATCH  | /api/auth/password |

### Tasks

| Method | Endpoint       |
| ------ | -------------- |
| GET    | /api/tasks     |
| POST   | /api/tasks     |
| GET    | /api/tasks/:id |
| PUT    | /api/tasks/:id |
| DELETE | /api/tasks/:id |

### Filters

| Method | Endpoint                      |
| ------ | ----------------------------- |
| GET    | /api/tasks?status=todo        |
| GET    | /api/tasks?status=in_progress |
| GET    | /api/tasks?status=done        |

---

## Running the Project

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Build for production:

```bash
npm run build
npm start
```

---

## Technical Notes

The implementation includes:

* TypeScript strict typing
* HTTP-only cookie authentication
* Session persistence
* Ownership validation on task access
* Proper HTTP status codes
* SQLite persistence
* Layered architecture
* Domain-driven business logic

---

## Future Improvements

Possible extensions include:

* Task search
* Task categories
* Due dates
* Pagination
* Dark mode
* Automated tests
* Docker support
* Role-based authorization

# Pedidos Jhoanes

A modern full-stack web application with a **NestJS** backend and a **Next.js** (React) frontend. The system manages product catalogs, user accounts with roles and discounts, transactional shopping orders, and administrative reports.

---

## 📂 Project Structure

This repository is split into two main directory workspaces:

- **[frontend/](frontend)**: A Next.js (React) modern single-page application utilizing TailwindCSS (v4) for premium user interfaces and styling.
- **[backend/](backend)**: A NestJS application that provides a robust REST API, backed by TypeORM with an SQLite database ([database.sqlite](database.sqlite)).
- **[docs/](docs)**: Documentation directory.
  - For an exhaustive technical reference detailing backend structure, modules, data flow, and database schema, please refer to the detailed [docs/backend.md](docs/backend.md).

---

## 🚀 Getting Started

### 1. Prerequisites & Environment Setup

Ensure you have Node.js installed on your machine. Both `frontend` and `backend` directories contain their respective `package.json` with dependency lists.

### 2. Start the Development Environment

Follow these steps to clean ports and spin up both servers locally:

1.  **Clear Conflicts (Ports)**: Ensure no lingering process is running on the default backend port `3001` (Windows PowerShell command):

```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue
```

2.  **Start the Backend API Server**:

```bash
cd backend
npm run start:dev
```

The server will start on [http://localhost:3001](http://localhost:3001).

3.  **Start the Frontend Client**:

```bash
cd frontend
npm run dev
```

The UI client will run on [http://localhost:3000](http://localhost:3000).

---

## 🧪 Running Tests

All automated tests are structured using the Jest framework and are located inside the `backend` directory. For detail on testing strategies, see the complete [.agent/plan.md](.agent/plan.md).

Navigate to the `backend` folder first:

```bash
cd backend
```

### Unit & Integration Tests

Runs tests targeting services, controllers, and TypeORM entities:

```bash
# Run all unit/integration tests
npm run test

# Run tests in live watch mode
npm run test:watch

# Generate test coverage reports
npm run test:cov
```

### End-to-End (E2E) Tests

Runs tests validating complete request-response flows with a test database:

```bash
npm run test:e2e
```

### Run Specific Test Files

To target a specific test suite or matching case description:

```bash
# Run a single file
npx jest src/users/users.service.spec.ts

# Run matching tests by pattern
npx jest -t "should calculate product price"
```

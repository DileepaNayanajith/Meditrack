# 🏥 MediTrack Backend Setup & Local MySQL Guide

This document explains how to set up and run the **Node.js / Express.js Backend** and **MySQL Server (MySQL Workbench)** for the **MediTrack – Medicine Stock and Expiry Management System**.

---

## 🛠️ Prerequisites

1. **Node.js** (v18 or higher)
2. **MySQL Server & MySQL Workbench** (Running locally on default port `3306`)

---

## 🚀 Quick Setup Instructions

### 1. Database Setup (MySQL Workbench)
Open **MySQL Workbench** or your MySQL command line client and verify that MySQL service is running.

You can initialize the `meditrack_db` database and sample data automatically or manually:

#### Option A: Automated Database Initialization (Recommended)
Configure your MySQL credentials in `backend/.env` (or set `DB_PASSWORD`), then run:
```bash
# Run from project root
npm run db:init

# Or run from backend folder
cd backend
npm run db:init
```

#### Option B: Manual Execution via MySQL Workbench
1. Open **MySQL Workbench**.
2. Connect to your local MySQL instance.
3. Open and execute [`backend/database/schema.sql`](file:///c:/Users/yashodha/OneDrive/Desktop/CAMPUS/Projects/Meditrack/backend/database/schema.sql) to create the database and tables.
4. Open and execute [`backend/database/seed.sql`](file:///c:/Users/yashodha/OneDrive/Desktop/CAMPUS/Projects/Meditrack/backend/database/seed.sql) to populate sample suppliers, medicines, low stock items, expiry alerts, and users.

---

### 2. Environment Configuration
Create or inspect the [`.env`](file:///c:/Users/yashodha/OneDrive/Desktop/CAMPUS/Projects/Meditrack/backend/.env) file inside the `backend/` directory based on [`.env.example`](file:///c:/Users/yashodha/OneDrive/Desktop/CAMPUS/Projects/Meditrack/backend/.env.example):

```env
PORT=5001
NODE_ENV=development

# Local MySQL Credentials
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=meditrack_db
DB_PORT=3306

JWT_SECRET=meditrack_jwt_secret_key_dev_2026
JWT_EXPIRES_IN=24h

CLIENT_URL=http://localhost:5173
```

---

### 3. Starting the Servers

#### Run Backend API Server
From the root workspace directory:
```bash
npm run server
```
Or for auto-reloading during development:
```bash
npm run server:dev
```
> The API will be live at: **`http://localhost:5001`**

#### Run Frontend React Server (in a separate terminal)
```bash
npm run dev
```
> The React app will run at: **`http://localhost:5173`**

---

## 📡 API Endpoint Reference

### 💊 Medicines API (`/api/medicines`)
- **`GET /api/medicines`**: List all medicines (supports filtering by `category`, `status` (`low`, `expiring`, `expired`), search `q`, and sorting).
- **`GET /api/medicines/summary`**: Get dashboard summary statistics (total stock, low stock count, expiring count, total value).
- **`GET /api/medicines/low-stock`**: Retrieve medicines where stock level $\le$ threshold.
- **`GET /api/medicines/expiring?days=60`**: Retrieve medicines expiring within $N$ days or already expired.
- **`GET /api/medicines/:id`**: Get detailed medicine & supplier info.
- **`POST /api/medicines`**: Add a new medicine stock batch.
- **`PUT /api/medicines/:id`**: Update existing medicine record.
- **`DELETE /api/medicines/:id`**: Remove a medicine record.

### 🏢 Suppliers API (`/api/suppliers`)
- **`GET /api/suppliers`**: Get all registered suppliers with medicine supply count.
- **`GET /api/suppliers/:id`**: Get supplier profile and supplied inventory list.
- **`POST /api/suppliers`**: Create a new supplier.
- **`PUT /api/suppliers/:id`**: Update supplier details.
- **`DELETE /api/suppliers/:id`**: Delete a supplier.

### 🔐 Auth & Users API (`/api/auth`)
- **`POST /api/auth/register`**: Register a new pharmacy user / staff member.
- **`POST /api/auth/login`**: Sign in with email & password, returns JWT token.
- **`GET /api/auth/me`**: Get active user session info.
- **`GET /api/auth/users`**: List registered pharmacy staff/admins.

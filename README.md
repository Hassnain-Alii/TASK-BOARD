# 🧠 TaskBoard Enterprise Edition (MERN)

A visually stunning, high-performance, and enterprise-grade secure Kanban Task Board. This application features a highly polished design system employing glassmorphism, fluid micro-animations, and drag-and-drop mechanics rivaling top-tier SaaS products like Trello.

---

## 🚀 Live Demo

Experience the dynamic TaskBoard interface and robust functionality firsthand:

- **Frontend Application:** [https://task-board-frontend-ten.vercel.app](https://task-board-frontend-ten.vercel.app)
- **Backend API:** [https://task-board-backend-sepia-seven.vercel.app](https://task-board-backend-sepia-seven.vercel.app)

---

## 🌟 App Capabilities & Features

### 🔥 Frontend (Vite + React)

- **Stunning UI/UX:** Built entirely with advanced custom CSS utilizing glassmorphism, dynamic gradients, and fluid `shake` animations on invalid inputs.

- **Drag & Drop (DnD):** Modern, intuitive task movement using `@dnd-kit`. Drag tasks between "Todo", "In-Progress", and "Done" columns with smooth animations.

- **CRUD Operations:** Create, Read, Update, and Delete tasks seamlessly with instant UI updates.

- **Advanced Filtering & Search:**
  - **High-Speed Search:** 300ms debounced search that filters through task titles and descriptions instantly.
  - **Priority Filtering:** Quick-toggle filters for High, Medium, and Low priority tasks.

- **Status Tracking:** Visual task markers for overdue items and priority levels.

### 📊 Dynamic Board Insights

- **Live Progress Tracking:** Circular progress ring showing the overall board completion percentage.
- **Real-time Stats:** Instant counters for Total Tasks, Completed, Overdue, and High Priority.
- **Visual Breakdown:** Graphical breakdown for each column (Todo, In-Progress, Done) to map your workflow distribution.
- **Loading Skeletons:** Professional skeleton-loaders used during initial data fetch to provide a premium user experience.

- **Advanced Error Handling & Toast Notifications:** Custom Toast system providing feedback for logins, edits, creations, and failures.

- **Responsive Layouts for Modern Web.**

### ⚙️ Backend (Node.js + Express)

- **Redis Caching:** Accelerates repetitive data queries (e.g., loading the task board) using an in-memory Redis cache per-user.

- **Response Compression:** All API responses are compressed via Gzip to reduce bandwidth and speed up page loads.

- **Supabase Cloud Storage:** Integrated Supabase (S3-compatible) for highly scalable cloud-native file/avatar uploads.

- **JWT Authentication:** Stateful user session management and strict validation for route security.

---

## 🛡️ Security Architecture

We prioritize the safety of your data with an enterprise-grade security stack.

### 1. **Helmet.js**

**What is it?** A security-focused middleware for Express.
**Why we use it?** It automatically sets 15+ HTTP security headers, protecting against common attacks like Clickjacking, Cross-Site Scripting (XSS), and MIME sniffing.

### 2. **HPP (HTTP Parameter Pollution)**

**What is it?** A security middleware that scans for duplicate URL parameters.
**Why we use it?** To prevent attackers from confusing the server with multiple parameters of the same name, which could potentially bypass input validation or logic checks.

### 3. **Pino-HTTP Logging**

**What is it?** An extremely high-performance logging library for JSON logs.
**Why we use it?** To provide a robust audit trail of all server interactions. For security teams, it provides detailed, structured data to monitor for anomalies without sacrificing performance.

### 4. **Express Rate Limiting**

**What is it?** A mechanism to limit the volume of requests a single IP can make.
**Why we use it?** We apply two levels of protection:

- **General API Limiting**: Prevents DDoS and resource exhaustion.
- **Auth Specific Limiting**: Places strict limits on login/signup attempts to mitigate brute-force and credential stuffing attacks.

### 5. **Advanced Session Management**

- **Short-Lived Access Tokens**: JWTs expire in **15 minutes** to minimize the impact of token leakage.
- **Silent Refresh**: As long as you are actively using the application, your session is automatically extended.
- **Auto-Logout**: For your security, the application automatically logs you out after **15 minutes of inactivity**.

### 6. **Input Validation (Express Validator)**

**What is it?** A powerful set of validation and sanitization tools.
**Why we use it?** Every piece of user input (emails, task titles, profile updates) is strictly validated and sanitized (escaped) to prevent **SQL/NoSQL Injection** and **Stored XSS**.

### 6. **CORS (`cors`)**

- **What it does:** Cross-Origin Resource Sharing.
- **How it protects:** Strictly bounds which domains can communicate with the backend via browsers, ensuring malicious websites cannot interact with your APIs on behalf of authenticated users via cross-origin requests.

### 7. **Compression (`compression`)**

- **What it does:** Compresses outbound HTTP responses (GZIP/Deflate).
- **How it protects:** While primarily a performance enhancement, it mitigates bandwidth exhaustion thereby assisting in neutralizing slow-loris or resource exhaustion attacks.

### 8. **Cookie Parser & Express Session (`cookie-parser`, `express-session`)**

- **What it does:** Securely parses and manages HTTP-only cookies and stateful sessions independent of JWT payload if needed.
- **How it protects:** Protects session IDs from being accessed via `document.cookie` (XSS vectors) by setting `HttpOnly`, `Secure`, and `SameSite` flags.

### 9. **Secure Data Handling**

- **Bcryptjs**: All passwords are salted and hashed 10 times, ensuring they are mathematically impossible to reverse-engineer.
- **Owner-Only Authorization**: Every task operation (view, edit, delete) is protected by a strict ownership check, ensuring users can only interact with their own data.

---

## 🏗️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Atlas)
- **Caching**: Redis (Upstash / Local)
- **Object Storage**: Supabase (Cloud)
- **Authentication**: JWT, Google OAuth 2.0 (Passport)
- **Frontend**: React.js, Vite
- **Styling**: Vanilla CSS (Tailwind/Modern Utilities)

---

## 🏗️ Infrastructure Components

### 1. **Docker & Docker Compose**

- **What is it?** A platform for containerization and a tool for defining and running multi-container applications.
- **Why we use it?** It ensures the application runs identically on any machine. Our `docker-compose.yml` orchestrates the entire stack (Node, Mongo, Redis) in isolated, secure networks, making deployment as simple as one command.

### 2. **Redis In-Memory Data Store**

- **What is it?** A high-performance, key-value storage system typically used for caching.
- **Why we use it?** To reduce database load and speed up data retrieval. By caching task boards in Redis, we achieve near-instant response times for returning users.

### 3. **Supabase Cloud Storage**

- **What is it?** A cloud-native project that provides object storage, database, and auth.
- **Why we use it?** Specifically for object storage to handle file uploads (like user avatars) in a "forever free" production environment. This keeps our database lightweight and removes the need for local storage management.

---

## 🐳 Quick Start (Docker Orchestration)

To spin up the entire cluster quickly for local development:

```bash
docker-compose up -d --build
```

This single command orchestrates:

1. **Node.js Express Server** (Port 5000)
2. **MongoDB Database** (Port 27017)
3. **Redis Cache** (Port 6379)
4. **React Client App** (Port 5173)

_Open `http://localhost:5173/` and enjoy the product!_

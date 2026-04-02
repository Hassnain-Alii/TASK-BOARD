# TaskBoard Project Features Checklist

## 🔐 Security Features
- [x] **Helmet.js**: Security headers for protection against XSS and Clickjacking.
- [x] **HPP (HTTP Parameter Pollution)**: Prevent parameter manipulation attacks.
- [x] **Pino-HTTP**: Enterprise-grade performance logging.
- [x] **Express Rate Limiting**: 
    - [x] API-wide protection (200 requests / 15 min).
    - [x] Auth routes protection (7 requests / 15 min).
- [x] **Input Validation & Sanitization**: Cross-site scripting (XSS) and injection protection for all fields.
- [x] **JWT Authentication**: Secure, stateless user sessions.
- [x] **Refresh Token / Session Logic**: 
    - [x] 15-minute token expiry.
    - [x] Silent refresh for active users.
    - [x] Auto-logout after 15 minutes of inactivity.
- [x] **Password Protection**: Bcryptjs with 10 salt rounds.
- [x] **CORS Management**: Domain-bound API access.
- [x] **Cookie Security**: HTTP-only, Secure, and SameSite cookie policies.
- [x] **Ownership Enforcement**: strict database checks for task access.

## 🐳 Infrastructure & Deployment
- [x] **Docker Containerization**: Portable environments for consistent deployment.
- [x] **Docker Compose**: Full-stack orchestration (Server, Client, Mongo, Redis, MinIO).
- [x] **Isolated Networking**: Container communication over bridge network for security.

## 🚀 Core Features
- [x] **Drag & Drop Dashboard**: Kanban board for visual task management (`@dnd-kit`).
- [x] **Redis Caching**: Sub-millisecond data retrieval for task lists.
- [x] **MinIO Integration**: Enterprise-grade object storage for file/avatar management.
- [x] **Progress Tracking**: Real-time board statistics and completion metrics.
- [x] **Google OAuth 2.0**: Social login integration.
- [x] **Search & Filtering**: Debounced search and priority-based filters.
- [x] **Responsive UI**: Glassmorphism design system optimized for all devices.

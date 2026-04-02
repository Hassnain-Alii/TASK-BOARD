require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

// Enterprise Security Modules
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const pinoHttp = require('pino-http')();
const session = require('express-session');
const compression = require('compression');
const cookieParser = require('cookie-parser');

// Passport (Google OAuth)
const passport = require('./config/passport');

const app = express();

// 1. Pino-HTTP Logging
app.use(pinoHttp);

// 2. Security Headers (Helmet)
app.use(helmet());

// 3. CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5174',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// 4. Rate Limiter (all /api routes)
// [SECURITY FIX]: Trust the reverse proxy ensuring rate-limits are based on actual client IPs, not the proxy IP.
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api', limiter);

// Stricter rate limit on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 7,
  message: { msg: 'Too many auth attempts, please try again later.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup');
app.use('/api/auth/forgot-password');

// 5. Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 6. Cookie Parser
app.use(cookieParser());

// 7. Express Session (required for Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'super_secret_session_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// 8. Passport Init
app.use(passport.initialize());
app.use(passport.session());

// 9. HPP - HTTP Parameter Pollution prevention
app.use(hpp());

// 10. Response Compression
app.use(compression());

// Connect Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('TaskBoard Enterprise Edition API — Secure & Running');
});

// Global error handler
app.use((err, req, res, next) => {
  req.log && req.log.error(err);
  res.status(err.status || 500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on port ${PORT} — Enterprise Security Active`));

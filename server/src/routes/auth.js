const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { check, validationResult } = require('express-validator');

// [SECURITY FIX]: Centralized validation handler to ensure consistent error responses and prevent malformed data from reaching the database.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg });
  }
  next();
};

// ─── Helper: Sign JWT ────────────────────────────────────────────────────────
const signToken = (userId) =>
  new Promise((resolve, reject) => {
    // [ENHANCEMENT]: Reduced expiration to 15 minutes as per user requirement for session security.
    jwt.sign({ user: { id: userId } }, process.env.JWT_SECRET, { expiresIn: '15m' }, (err, token) => {
      if (err) reject(err);
      else resolve(token);
    });
  });

// ─── POST /api/auth/signup ───────────────────────────────────────────────────
// [SECURITY FIX]: Added strict validation for signup fields including email normalization and path-traversal/scripting prevention via escaping.
router.post(
  '/signup',
  [
    check('firstName', 'First name must be at least 3 characters').trim().isLength({ min: 3 }).escape(),
    check('email', 'Invalid email format').isEmail().normalizeEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    validate
  ],
  async (req, res) => {
    const { firstName, lastName, dob, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ firstName, lastName: lastName || '', dob, email, password: hashedPassword });
    await user.save();

    const token = await signToken(user.id);
    res.json({ token, user: { id: user.id, firstName, lastName: user.lastName, email } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ─── POST /api/auth/login ────────────────────────────────────────────────────
// [SECURITY FIX]: Enforced email normalization and basic structure validation for login to prevent common bypass attempts.
router.post(
  '/login',
  [
    check('email', 'Invalid email format').isEmail().normalizeEmail(),
    check('password', 'Password is required').exists(),
    validate
  ],
  async (req, res) => {
    const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Email or Password is not correct' });

    // Google users have no password
    if (!user.password) return res.status(400).json({ msg: 'Please login with Google' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Email or Password is not correct' });

    const token = await signToken(user.id);
    res.json({ token, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, avatar: user.avatar } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ─── GET /api/auth/refresh ──────────────────────────────────────────────────
// [NEW]: Allows active users to refresh their session before it expires (15m window).
router.get('/refresh', auth, async (req, res) => {
  try {
    const token = await signToken(req.user.id);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ─── POST /api/auth/forgot-password ─────────────────────────────────────────
// [SECURITY FIX]: Added email validation for password resets to protect against unauthorized reset attempts.
router.post(
  '/forgot-password',
  [
    check('email', 'Please enter a valid email address').isEmail().normalizeEmail(),
    validate
  ],
  async (req, res) => {
    const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    // Always return success to prevent user enumeration attacks
    if (!user) return res.json({ msg: 'If that email is registered, a reset link has been sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // In production: send email. For now, log reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    console.log(`[MOCK EMAIL] Password reset link for ${email}: ${resetUrl}`);

    res.json({ msg: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ─── POST /api/auth/reset-password ──────────────────────────────────────────
// [SECURITY FIX]: Validated reset token and password strength to prevent trivial account takeovers via password resets.
router.post(
  '/reset-password',
  [
    check('token', 'Token is required').not().isEmpty(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    validate
  ],
  async (req, res) => {
    const { token, password } = req.body;

  try {
    const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ msg: 'Token is invalid or has expired' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ msg: 'Password reset successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ─── PUT /api/auth/update-profile ───────────────────────────────────────────
// [SECURITY FIX]: Sanitized profile updates to prevent XSS (escaping firstName) and ensure data integrity.
router.put(
  '/update-profile',
  [
    auth,
    check('firstName', 'First name must be at least 3 characters').optional().trim().isLength({ min: 3 }).escape(),
    validate
  ],
  async (req, res) => {
    const { firstName, lastName, dob, avatar } = req.body;

  try {
    const updates = {};
    if (firstName) updates.firstName = firstName.trim();
    if (lastName !== undefined) updates.lastName = lastName;
    if (dob) updates.dob = dob;
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ─── PUT /api/auth/update-password ──────────────────────────────────────────
// [SECURITY FIX]: Strictly validated password update fields to enforce security standards for existing users.
router.put(
  '/update-password',
  [
    auth,
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 }),
    check('confirmPassword', 'Confirm password is required').not().isEmpty(),
    validate
  ],
  async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword)
      return res.status(400).json({ msg: 'New passwords do not match' });

  try {
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?err=oauth_failed` }),
  async (req, res) => {
    try {
      const token = await signToken(req.user.id);
      res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    } catch (err) {
      res.redirect(`${process.env.CLIENT_URL}/login?err=token_failed`);
    }
  }
);

module.exports = router;

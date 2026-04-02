const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, default: '' },
  dob: { type: Date },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for OAuth users
  avatar: { type: String, default: '' },
  googleId: { type: String },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);

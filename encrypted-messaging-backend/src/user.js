const mongoose = require ('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  username: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
  isBlocked: { type: Boolean, default: false },
  profilePic: String,
  statusText: { type: String, default: 'Hey there! I am using EncryptedApp' },
  twoFactorEnabled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

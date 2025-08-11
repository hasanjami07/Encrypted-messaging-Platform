const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Change Role
exports.changeRole = async (req, res) => {
  const { userId, role } = req.body;
  try {
    await User.findByIdAndUpdate(userId, { role });
    res.json({ message: 'User role updated' });
  } catch (err) {
    res.status(500).json({ message: 'Role update failed' });
  }
};

// Block / Unblock
exports.toggleBlock = async (req, res) => {
  const { userId, isBlocked } = req.body;
  try {
    await User.findByIdAndUpdate(userId, { isBlocked });
    res.json({ message: isBlocked ? 'User blocked' : 'User unblocked' });
  } catch (err) {
    res.status(500).json({ message: 'Block/unblock failed' });
  }
};

// Force Password Reset
exports.forceResetPassword = async (req, res) => {
  const { userId, newPassword } = req.body;
  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashed });
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Password reset failed' });
  }
};

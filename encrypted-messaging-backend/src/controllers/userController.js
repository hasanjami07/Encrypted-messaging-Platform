const User = require('../models/User');

// View Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  const { name, username, email, statusText, profilePic} = req.body;
  try {
    await User.findByIdAndUpdate(req.user.id, {
      name, username, email, statusText, profilePic
    });
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
};

const express = require('express');
const { auth, isAdmin } = require('../middleware/authMiddleware');
const { changeRole, toggleBlock, forceResetPassword } = require('../controllers/adminController');

const router = express.Router();

router.put('/role', auth, isAdmin, changeRole);
router.put('/block', auth, isAdmin, toggleBlock);
router.put('/reset-password', auth, isAdmin, forceResetPassword);

module.exports = router;

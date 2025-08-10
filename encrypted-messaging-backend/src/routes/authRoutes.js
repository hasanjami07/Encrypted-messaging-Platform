const express = require("express");
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/auth.controller");  // use either with or without .js, but only once
const { verifyToken } = require("../middleware/auth.middleware"); 

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", verifyToken, logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/change-password", verifyToken, changePassword);

module.exports = router;


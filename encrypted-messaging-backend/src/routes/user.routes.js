// routes/user.routes.js
const express = require("express");
const router = express.Router();
const {verifyToken} = require("../middleware/auth.middleware");
const userController = require("../controllers/user.controller");

router.get("/profile", verifyToken, userController.getProfile);

module.exports = router;

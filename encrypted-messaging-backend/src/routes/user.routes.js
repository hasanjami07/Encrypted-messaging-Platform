// routes/user.routes.js
const express = require("express");
const router = express.Router();
const {verifyToken} = require("../middleware/auth.middleware");
const userController = require("../controllers/user.controller");
const prisma = require("../prismaClient");

router.get("/profile", verifyToken, userController.getProfile);

router.get("/all", verifyToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { id: { not: req.userId } },
      select: { id: true, name: true, email: true } // you can add username if you have
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

module.exports = router;

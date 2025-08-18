// routes/user.routes.js
const express = require("express");
const router = express.Router();
const {verifyToken} = require("../middleware/auth.middleware");
const userController = require("../controllers/user.controller");
const prisma = require("../prismaClient");
const { getUserByEmail } = require("../controllers/user.controller");

router.get("/profile", verifyToken, userController.getProfile);

// GET user by email
router.get("/by-email", getUserByEmail);

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

router.get("/find", verifyToken, async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ user });
});

// Get my active chats
router.get("/my-chats/:userId", verifyToken, async (req, res) => {
  const userId = req.params.userId;

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  const chats = [];
  const map = new Map();
  messages.forEach((msg) => {
    const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (partnerId && !map.has(partnerId)) {
      map.set(partnerId, true);
      chats.push({ userId: partnerId, lastMessage: msg.content, createdAt: msg.createdAt });
    }
  });

  res.json({ chats });
});
module.exports = router;

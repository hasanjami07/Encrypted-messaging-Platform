const express = require("express");
const router = express.Router();
const { encrypt, decrypt } = require("../utils/encryption");
const prisma = require("../prismaClient");
const io = require("../server"); // assuming you export io from socket.js or similar
const { verifyToken } = require("../middleware/auth.middleware");


// POST /api/messages - Send a message (encrypt and save)
router.post("/messages", verifyToken, async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const senderId = req.userId || req.body.senderId;
    const { groupId = null, text } = req.body;

    console.log("Received message:", { senderId, groupId, text });

    
    if (!senderId) {
      return res.status(400).json({ error: "Missing senderId (token or body)" });
    }
    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }
    if (!receiverId && !groupId) {
      return res.status(400).json({ error: "Must provide receiverId or groupId" });
    }
    // optional: quick ObjectId-like format check (24 hex chars)
    const isObjectId = (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
    
    // if (!isObjectId(senderId)) return res.status(400).json({ error: "senderId not valid ObjectId" });

    const { iv, encryptedData } = encrypt(text);
    console.log("Encrypted data:", { iv, encryptedData });

    
    const message = await prisma.message.create({
      data: {
        senderId: String(senderId),
        receiverId: receiverId ? String(receiverId) : null,
        groupId: groupId ? String(groupId) : null,
        content: encryptedData,
        iv,
      },
    });

    // Emit via socket.io (room names are arbitrary)
    const room = groupId ? `group-${groupId}` : `user-${senderId}`;
    if (io && io.to) {
      io.to(room).emit("newMessage", {
        ...message,
        content: text, // decrypted for immediate client display (server-side)
      });
    }

    return res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    
    return res.status(500).json({
      error: "Failed to send message",
      details: error.message,
      stack: error.stack && error.stack.split("\n").slice(0,3) // small stack slice
    });
  }
});



// GET /api/messages/:conversationId - Fetch and decrypt messages for a conversation
router.get("/messages/group/:groupId", verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const encryptedMessages = await prisma.message.findMany({
      where: { groupId: String(groupId) },
      orderBy: { createdAt: "asc" },
    });

    const decryptedMessages = encryptedMessages.map(msg => ({
      ...msg,
      content: decrypt(msg.content, msg.iv),
    }));

    res.json(decryptedMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch group messages" });
  }
});

router.get("/messages/private/:userId", verifyToken, async (req, res) => {
  try {
    const userId = req.userId; // logged-in user from token
    const otherUserId = req.params.userId;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: "asc" }
    });

    const decryptedMessages = messages.map(msg => ({
      ...msg,
      content: decrypt(msg.content, msg.iv),
    }));

    res.json(decryptedMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch private messages" });
  }
});



module.exports = router;

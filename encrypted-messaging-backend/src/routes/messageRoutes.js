const express = require("express");
const router = express.Router();

const { encrypt, decrypt } = require("../utils/encryption");
const prisma = require("../prismaClient");
const io = require("../server"); // assuming you export io from socket.js or similar

// POST /api/messages - Send a message (encrypt and save)
router.post("/messages", async (req, res) => {
  try {
    const { senderId, groupId, text } = req.body;

    if (!senderId || !text) {
      return res.status(400).json({ error: "senderId and text are required" });
    }

    const { iv, encryptedData } = encrypt(text);

    const message = await prisma.message.create({
      data: {
        senderId: Number(senderId),
        groupId: groupId ? Number(groupId) : null,
        content: encryptedData,
        iv,
      },
    });

    // Emit new message to clients in the room
    const room = groupId ? `group-${groupId}` : `user-${senderId}`;
    io.to(room).emit("newMessage", {
      ...message,
      content: text, // send decrypted text for immediate display
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// GET /api/messages/:conversationId - Fetch and decrypt messages for a conversation
router.get("/messages/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;

    const encryptedMessages = await prisma.message.findMany({
      where: { groupId: Number(conversationId) },
      orderBy: { createdAt: "asc" },
    });

    const decryptedMessages = encryptedMessages.map((msg) => {
      return {
        ...msg,
        content: decrypt(msg.content, msg.iv),
      };
    });

    res.json(decryptedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;

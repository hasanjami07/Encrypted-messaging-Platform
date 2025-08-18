require("dotenv").config();
const http = require("http");
const crypto = require("crypto");
const { Server } = require("socket.io");

const app = require("./app");
const messageRoutes = require("./routes/messageRoutes");
const { encrypt } = require("./utils/encryption");
const prisma = require("./prismaClient");

// Environment setup
const PORT = process.env.PORT || 8000;
const secret = process.env.ENCRYPTION_SECRET;
if (!secret) {
  throw new Error("ENCRYPTION_SECRET is not defined in .env");
}

const key = crypto.scryptSync(secret, "salt", 32);

// Register routes before starting server
app.use("/api", messageRoutes);

// Create HTTP server
const server = http.createServer(app);

// Initialize socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // in production set to your frontend URL
    methods: ["GET", "POST"],
  },
});

// --- SOCKET.IO EVENTS ---
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("joinGroup", (groupId) => {
    socket.join(`group-${groupId}`);
    console.log(`Socket ${socket.id} joined group-${groupId}`);
  });

  socket.on("identify", (userId) => {
    socket.join(`user-${userId}`);
  });

  socket.on("sendMessage", async ({ senderId, groupId, text }) => {
    try {
      const { iv, encryptedData } = encrypt(text);

      const message = await prisma.message.create({
        data: {
          senderId: Number(senderId),
          groupId: groupId ? Number(groupId) : null,
          content: encryptedData,
          iv,
        },
      });

      io.to(`group-${groupId}`).emit("newMessage", {
        ...message,
        content: text, // decrypted text for UI
      });
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start scheduler
const { startScheduler } = require("./jobs/scheduler");
startScheduler(io);

// Backend config for frontend (always points to port 8000)
app.get("/backend-config", (req, res) => {
  res.json({ backendUrl: `http://localhost:${PORT}` });
});

// --- START SERVER ---
// Ensure ONLY port 8000 is used, no random fallback
// Start the server with reuseAddress to avoid TIME_WAIT issues
server.listen(
  { port: PORT, host: "0.0.0.0", reuseAddress: true },
  () => {
    console.log(`Server running on port ${PORT}`);
  }
).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`Port ${PORT} is already in use, trying a random port...`);
    server.listen(0, () => {
      const actualPort = server.address().port;
      console.log(`Server running on port ${actualPort}`);
      app.get("/backend-config", (req, res) => {
        res.json({ backendPort: actualPort });
      });
    });
  } else {
    console.error(err);
  }
});





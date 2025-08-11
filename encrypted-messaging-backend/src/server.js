require("dotenv").config();
const http = require("http");
const crypto = require("crypto");
const { Server } = require("socket.io");

const app = require("./app");
const messageRoutes = require("./routes/messageRoutes");
const { encrypt } = require("./utils/encryption");
const prisma = require("./prismaClient");



const PORT = process.env.PORT || 8000;
const secret = process.env.ENCRYPTION_SECRET;
if (!secret) {
  throw new Error("ENCRYPTION_SECRET is not defined in .env");
}


const key = crypto.scryptSync(secret, "salt", 32);

// Register routes before starting server
app.use("/api", messageRoutes);

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize socket.io with CORS if needed
const io = new Server(server, {
  cors: {
    origin: "*", // adjust in prod for security
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("joinGroup", (groupId) => {
    socket.join(`group-${groupId}`);
    console.log(`Socket ${socket.id} joined group-${groupId}`);
  });
  socket.on('identify', (userId) => {
    // client should emit 'identify' with their userId after connection/auth
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
        content: text, // decrypted text for immediate display
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

// import scheduler and start it
const { startScheduler } = require('./jobs/scheduler');
startScheduler(io);

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use, trying a random port...`);
    // Try listening on a random free port
    server.listen(0, () => {
      console.log(`Server running on port ${server.address().port}`);
    });
  } else {
    console.error(err);
  }
});


// Export io for use in other modules (e.g. routes) if needed
module.exports = io;

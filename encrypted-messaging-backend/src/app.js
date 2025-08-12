// src/app.js

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const { PrismaClient } = require('@prisma/client');
const messageRoutes = require("./routes/messageRoutes");
const scheduledRoutes = require('./routes/scheduledRoutes');
const contactRoutes = require("./routes/contactRoutes");
const userRoutes = require("./routes/user.routes");
require('dotenv').config();


const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use("/api", messageRoutes);
app.use("/api/contacts", contactRoutes);
app.use('/api/scheduled', scheduledRoutes);
app.use("/api/user", userRoutes);
// Test route
app.get('/', (req, res) => {
  res.send('Encrypted Messaging Backend is running!');
});

// Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);

});


module.exports = app;
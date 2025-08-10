// src/app.js

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const { PrismaClient } = require('@prisma/client');
const messageRoutes = require("./routes/messageRoutes");


const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use("/api", messageRoutes);

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
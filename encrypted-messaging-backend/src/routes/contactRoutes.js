const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const { verifyToken } = require('../middleware/auth.middleware');

// Get all contacts for the authenticated user
router.get("/", verifyToken, async (req, res) => {
  const userId = req.userId; // from middleware
  try {
    const contacts = await prisma.contact.findMany({
      where: { ownerId: userId },
      // you might want to include user/contact info here if needed
    });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// Add a contact
router.post("/", verifyToken, async (req, res) => {
  const ownerId = req.userId;
  const { contactId } = req.body;

  if (!contactId) {
    return res.status(400).json({ error: "contactId is required" });
  }

  try {
    const contact = await prisma.contact.create({
      data: { ownerId, contactId },
    });
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: "Failed to add contact" });
  }
});

// Remove a contact
router.delete("/:contactId", verifyToken, async (req, res) => {
  const ownerId = req.userId;
  const contactId = req.params.contactId;

  try {
    await prisma.contact.deleteMany({
      where: { ownerId, contactId },
    });
    res.json({ message: "Contact removed" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove contact" });
  }
});

module.exports = router;

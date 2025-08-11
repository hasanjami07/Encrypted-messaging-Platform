const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add a contact
exports.addContact = async (req, res) => {
  try {
    const { contactId } = req.body;
    const userId = req.user.id; // from JWT middleware

    if (!contactId) {
      return res.status(400).json({ error: "contactId is required" });
    }

    // Check if contact exists as a user
    const contactUser = await prisma.user.findUnique({ where: { id: contactId } });
    if (!contactUser) {
      return res.status(404).json({ error: "Contact user not found" });
    }

    // Add to contact list
    const contact = await prisma.contact.create({
      data: { userId, contactId }
    });

    res.status(201).json({ message: "Contact added successfully", contact });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: "Contact already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Get contact list
exports.getContacts = async (req, res) => {
  try {
    const userId = req.user.id;

    const contacts = await prisma.contact.findMany({
      where: { userId },
      include: { user: true }
    });

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove a contact
exports.removeContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user.id;

    await prisma.contact.deleteMany({
      where: { userId, contactId }
    });

    res.json({ message: "Contact removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

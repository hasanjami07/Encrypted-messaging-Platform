// src/controllers/scheduledController.js
const prisma = require('../prismaClient');
const { encrypt } = require('../utils/encryption'); // encrypt function present

async function scheduleMessage(req, res) {
  try {
    const senderId = req.userId || req.body.senderId;
    const { recipientId, plaintext, scheduledFor, isRecurring, recurringType } = req.body;

    if (!senderId || !recipientId || !scheduledFor || (!plaintext && !req.body.encryptedText)) {
      return res.status(400).json({ error: 'senderId, recipientId, scheduledFor and message required' });
    }

    // Encrypt if plaintext provided
    let encryptedText = req.body.encryptedText;
    let iv = req.body.iv;
    if (plaintext) {
      const enc = encrypt(plaintext);
      encryptedText = enc.encryptedData;
      iv = enc.iv;
    }

    const scheduled = await prisma.scheduledMessage.create({
      data: {
        senderId: String(senderId),
        recipientId: String(recipientId),
        encryptedText,
        iv,
        scheduledFor: new Date(scheduledFor),
        isRecurring: !!isRecurring,
        recurringType: recurringType || null,
      },
    });

    res.status(201).json({ success: true, scheduled });
  } catch (err) {
    console.error('scheduleMessage error', err);
    res.status(500).json({ error: err.message });
  }
}

async function getScheduledForUser(req, res) {
  try {
    const userId = req.userId || req.query.userId;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const list = await prisma.scheduledMessage.findMany({
      where: { senderId: String(userId) },
      orderBy: { scheduledFor: 'desc' },
    });

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

async function deleteScheduled(req, res) {
  try {
    const id = req.params.id;
    await prisma.scheduledMessage.deleteMany({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  scheduleMessage,
  getScheduledForUser,
  deleteScheduled,
};

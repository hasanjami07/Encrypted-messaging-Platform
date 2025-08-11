// src/jobs/scheduler.js
const prisma = require('../prismaClient');
const { decrypt } = require('../utils/encryption'); // decrypt(encryptedData, iv)
const io = require('../utils/socket'); // optional, we will pass io from server

// Helper to compute next scheduled time for recurring messages
function nextDateForRecurring(date, type) {
  const next = new Date(date);
  if (type === 'daily') next.setDate(next.getDate() + 1);
  else if (type === 'weekly') next.setDate(next.getDate() + 7);
  else if (type === 'monthly') next.setMonth(next.getMonth() + 1);
  return next;
}

function startScheduler(ioInstance) {
  // run every 30 seconds
  setInterval(async () => {
    try {
      const now = new Date();
      // find pending messages due up to now
      const due = await prisma.scheduledMessage.findMany({
        where: {
          scheduledFor: { lte: now },
          status: 'pending',
        },
      });

      if (due.length === 0) return;

      for (const msg of due) {
        try {
          // decrypt message (server has ENCRYPTION_SECRET)
          const plaintext = decrypt(msg.encryptedText, msg.iv);

          // Send via socket.io to recipient — adjust the room naming to your app
          // We assume client sockets join a room named `user-<recipientId>`
          if (ioInstance) {
            ioInstance.to(`user-${msg.recipientId}`).emit('newMessage', {
              id: msg.id,
              senderId: msg.senderId,
              recipientId: msg.recipientId,
              content: plaintext,
              scheduledFor: msg.scheduledFor,
              isScheduled: true,
            });
          } else {
            console.log('Would emit to', `user-${msg.recipientId}`, plaintext);
          }

          // If recurring, compute next date and update scheduledFor
          if (msg.isRecurring && msg.recurringType) {
            const nextDate = nextDateForRecurring(msg.scheduledFor, msg.recurringType);
            await prisma.scheduledMessage.update({
              where: { id: msg.id },
              data: { scheduledFor: nextDate, updatedAt: new Date() },
            });
          } else {
            // mark as sent
            await prisma.scheduledMessage.update({
              where: { id: msg.id },
              data: { status: 'sent', updatedAt: new Date() },
            });
          }
        } catch (err) {
          console.error('Failed to send scheduled message', msg.id, err);
          await prisma.scheduledMessage.update({
            where: { id: msg.id },
            data: { status: 'failed', updatedAt: new Date() },
          });
        }
      }
    } catch (err) {
      console.error('Scheduler error', err);
    }
  }, 30 * 1000);
}

module.exports = { startScheduler };

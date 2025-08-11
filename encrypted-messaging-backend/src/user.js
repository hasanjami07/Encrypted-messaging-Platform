const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getUserById = (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, username: true, email: true, profilePic: true, statusText: true, role: true, isBlocked: true }
  });
};

exports.updateUser = (id, data) => {
  return prisma.user.update({
    where: { id },
    data
  });
};

exports.changeRole = (userId, role) => {
  return prisma.user.update({
    where: { id: userId },
    data: { role }
  });
};

exports.toggleBlock = (userId, isBlocked) => {
  return prisma.user.update({
    where: { id: userId },
    data: { isBlocked }
  });
};

exports.resetPassword = async (userId, hashedPassword) => {
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });
};

const prisma = require('../prismaClient');

async function getProfile(req, res) {
  try {
    const userId = req.userId;  // Set by your verifyToken middleware
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// NEW: Fetch a user by email
async function getUserByEmail(req, res) {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("getUserByEmail error:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
}

module.exports = {
  getProfile,
  getUserByEmail,  // export the new function
};

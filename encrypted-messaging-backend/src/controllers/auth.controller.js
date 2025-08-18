const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient"); 
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// REGISTER  


const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("📥 Incoming register data:", { name, email, password });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // storing as plain text
      },
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Register error details:", error); // log full error
    res.status(500).json({ error: "Registration failed", details: error.message });
  }
};

module.exports = { register };


// LOGIN 
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("📥 Incoming login data:", { email, password });

    if (!email || !password) {
      console.log("⚠️ Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("🗄️ Stored password:", user.password);

    // Direct comparison
    if (password !== user.password) {
      console.log(`❌ Password mismatch: entered "${password}" vs stored "${user.password}"`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ Login successful for:", email);
    res.json({ token, user });
  } catch (error) {
    console.error("❌ Login error details:", error);
    res.status(500).json({ error: error.message });
  }
};

// LOGOUT
const logout = async (req, res) => {
    res.json({ message: "Logged out successfully" });
};

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    await prisma.user.update({
        where: { email },
        data: {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
        }
    });

    // TODO: send resetToken via email
    res.json({ message: "Password reset link generated", token: resetToken });
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await prisma.user.findFirst({
        where: {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { gt: new Date() }
        }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null }
    });

    res.json({ message: "Password has been reset" });
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword }
    });

    res.json({ message: "Password changed successfully" });
};

module.exports = {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    changePassword
};

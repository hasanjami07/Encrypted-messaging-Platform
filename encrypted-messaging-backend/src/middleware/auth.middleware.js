const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;   // use the same key you signed token with, likely 'id' or 'userId'
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { verifyToken };

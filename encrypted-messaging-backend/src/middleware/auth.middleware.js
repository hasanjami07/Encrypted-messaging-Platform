
const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  console.log("Auth header:", authHeader);
  if (!authHeader) {
    console.log("No auth header");
    return res.status(401).json({ message: "Unauthorized: no auth header" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    console.log("Malformed auth header");
    return res.status(401).json({ message: "Unauthorized: malformed auth header" });
  }

  const token = parts[1];
  console.log("Token extracted:", token);
  if (!token) {
    console.log("No token found");
    return res.status(401).json({ message: "Unauthorized: no token found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.log("Token verification failed:", err.message);
    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }
}


module.exports = { verifyToken };


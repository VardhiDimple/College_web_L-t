// backend/middleware/auth.js
const jwtLib = require("jsonwebtoken");

/**
 * JWT auth middleware
 * Expects header: Authorization: Bearer <token>
 */
module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwtLib.verify(
      token,
      process.env.JWT_SECRET || "dev_secret"
    );

    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

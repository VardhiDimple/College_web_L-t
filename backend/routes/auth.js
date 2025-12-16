// backend/routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();

const User = require("../models/User"); // make sure this path is correct

// Helper: create JWT
function createToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );
}

// ---------- SIGNUP ----------
router.post("/signup", async (req, res) => {
  try {
    let { email, password, name, role } = req.body;

    // 1) Normalise role coming from frontend
    if (role !== "faculty" && role !== "student") {
      role = "student"; // default fallback
    }

    // 2) Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    // 3) Hash password (your code may use bcrypt/hashPassword etc.)
    const bcrypt = require("bcryptjs");
    const passwordHash = await bcrypt.hash(password, 10);

    // 4) CREATE USER WITH THAT ROLE
    const user = new User({
      email,
      name,
      passwordHash,          // or whatever your schema uses
      role,                  // ✅ uses "student" or "faculty"
    });

    await user.save();

    // 5) Issue token as before
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ---------- LOGIN ----------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = createToken(user);

    // 🔥 THIS IS VERY IMPORTANT: role comes from DB
    return res.json({
      token,
      email: user.email,
      role: user.role,
      name: user.name || user.email.split("@")[0],
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error during login" });
  }
});

// ---------- ME (optional, useful for debugging) ----------
const authMiddleware = require("../middleware/auth"); // if you have it
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

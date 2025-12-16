// backend/routes/faculty.js
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const User = require("../models/User");
const Mark = require("../models/Mark");
const FinanceRecord = require("../models/FinanceRecord");
const FacultyProfile = require("../models/FacultyProfile");

// GET /api/faculty/me
router.get("/me", auth, async (req, res) => {
  try {
    if (req.user.role !== "faculty") {
      return res.status(403).json({ error: "Faculty only" });
    }

    const prof = await FacultyProfile.findOne({ userId: req.user.id }).lean();
    res.json(prof || null);
  } catch (err) {
    console.error("Faculty me error:", err);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

// POST /api/faculty/profile
router.post("/profile", auth, async (req, res) => {
  try {
    if (req.user.role !== "faculty") {
      return res.status(403).json({ error: "Faculty only" });
    }

    const { dept, designation } = req.body;
    const filter = { userId: req.user.id };
    const update = { dept, designation };

    const prof = await FacultyProfile.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    res.json(prof);
  } catch (err) {
    console.error("Faculty profile error:", err);
    res.status(500).json({ error: "Failed to save profile" });
  }
});

router.get("/student-summary", auth, async (req, res) => {
  try {
    if (req.user.role !== "faculty") {
      return res.status(403).json({ error: "Faculty only" });
    }

    const email = req.query.email;
    if (!email) return res.status(400).json({ error: "Email required" });

    // 🔥 do NOT filter by role = student (many accounts missing role)
    const student = await User.findOne({ email });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const marks = await Mark.find({ studentEmail: email });
    const finance = await FinanceRecord.find({ studentEmail: email });

    return res.json({
      student: {
        name: student.name,
        email: student.email,
      },
      marks,
      finance,
    });
  } catch (err) {
    console.error("student-summary error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;

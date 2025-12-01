const express = require("express");
const auth = require("../middleware/auth");
const StudentProfile = require("../models/StudentProfile");

const router = express.Router();

// GET /api/student/me
router.get("/me", auth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Students only" });
    }
    let prof = await StudentProfile.findOne({ userId: req.user.id }).lean();
    res.json(prof || null);
  } catch (err) {
    console.error("Student me error:", err);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

// POST /api/student/profile  (create/update)
router.post("/profile", auth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Students only" });
    }

    const { rollNo, dept, year, photoUrl } = req.body;
    const filter = { userId: req.user.id };
    const update = { rollNo, dept, year, photoUrl };

    const prof = await StudentProfile.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    res.json(prof);
  } catch (err) {
    console.error("Student profile error:", err);
    res.status(500).json({ error: "Failed to save profile" });
  }
});

module.exports = router;

const express = require("express");
const auth = require("../middleware/auth");
const FacultyProfile = require("../models/FacultyProfile");

const router = express.Router();

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

module.exports = router;

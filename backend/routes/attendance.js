// routes/attendance.js
const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const auth = require("../middleware/auth");

// POST /api/attendance  → faculty saves attendance
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "faculty") {
      return res.status(403).json({ error: "Only faculty can mark attendance" });
    }

    const { date, subject, entries } = req.body;

    if (!date || !subject || !Array.isArray(entries)) {
      return res.status(400).json({ error: "Missing date, subject or entries" });
    }

    if (!entries.length) {
      return res.status(400).json({ error: "No attendance entries provided" });
    }

    const doc = await Attendance.create({
      faculty: req.user.id,
      date: new Date(date),
      subject,
      entries: entries.map((e) => ({
        studentEmail: e.email,
        present: !!e.present,
      })),
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.error("Attendance save error:", err);
    return res.status(500).json({ error: "Server error saving attendance" });
  }
});

// GET /api/attendance/me  → student: get own attendance
router.get("/me", auth, async (req, res) => {
  try {
    const email = req.user.email;

    // Find all documents where this student appears
    const docs = await Attendance.find({
      "entries.studentEmail": email,
    }).lean();

    const flat = [];
    docs.forEach((doc) => {
      (doc.entries || []).forEach((e) => {
        if (e.studentEmail === email) {
          flat.push({
            date: doc.date,
            subject: doc.subject,
            present: e.present,
          });
        }
      });
    });

    return res.json(flat); // [{ date, subject, present }, ...]
  } catch (err) {
    console.error("Attendance fetch error:", err);
    return res.status(500).json({ error: "Server error fetching attendance" });
  }
});

module.exports = router;

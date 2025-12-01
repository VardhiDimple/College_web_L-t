// routes/marks.js
const express = require("express");
const router = express.Router();
const Mark = require("../models/Mark");
const auth = require("../middleware/auth");

// POST /api/marks  → faculty save or update marks for a subject
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "faculty") {
      return res.status(403).json({ error: "Only faculty can save marks" });
    }

    const { subject, maxMarks, entries } = req.body;

    if (!subject || !maxMarks || !Array.isArray(entries)) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Upsert: if marks for this faculty+subject already exist → update
    let doc = await Mark.findOne({
      faculty: req.user.id,
      subject,
    });

    if (!doc) {
      doc = new Mark({
        faculty: req.user.id,
        subject,
      });
    }

    doc.maxMarks = maxMarks;
    doc.entries = entries.map((e) => ({
      studentEmail: e.email,
      marks: e.marks,
      grade: e.grade,
    }));
    doc.date = new Date();

    await doc.save();

    res.json(doc);
  } catch (err) {
    console.error("Marks save error:", err);
    res.status(500).json({ error: "Server error saving marks" });
  }
});

// GET /api/marks/me  → student: own marks for all subjects
router.get("/me", auth, async (req, res) => {
  try {
    const email = req.user.email;

    const docs = await Mark.find({
      "entries.studentEmail": email,
    }).lean();

    const flat = [];
    docs.forEach((doc) => {
      (doc.entries || []).forEach((e) => {
        if (e.studentEmail === email) {
          flat.push({
            subject: doc.subject,
            maxMarks: doc.maxMarks,
            marks: e.marks,
            grade: e.grade,
          });
        }
      });
    });

    res.json(flat); // [{ subject, maxMarks, marks, grade }, ...]
  } catch (err) {
    console.error("Marks fetch error:", err);
    res.status(500).json({ error: "Server error fetching marks" });
  }
});

// GET /api/marks/subject/:code → faculty load marks to edit
router.get("/subject/:code", auth, async (req, res) => {
  try {
    if (req.user.role !== "faculty") {
      return res.status(403).json({ error: "Only faculty can view subject marks" });
    }

    const subject = req.params.code;
    const doc = await Mark.findOne({
      faculty: req.user.id,
      subject,
    }).lean();

    if (!doc) {
      return res.json(null);
    }

    res.json(doc);
  } catch (err) {
    console.error("Marks subject fetch error:", err);
    res.status(500).json({ error: "Server error fetching subject marks" });
  }
});

module.exports = router;

const express = require("express");
const GradeRecord = require("../models/GradeRecord");
const auth = require("../middleware/auth");

const router = express.Router();

// POST /api/grades/bulk
// { semester, grades: [{ courseCode, courseName, credits, grade, rollNo? }] }
router.post("/bulk", auth, async (req, res) => {
  try {
    const user = req.user || {};
    if (!user.email) {
      return res.status(400).json({ error: "Token does not contain email" });
    }

    const { grades, semester } = req.body;
    if (!Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({ error: "grades array is required" });
    }

    if (semester) {
      await GradeRecord.deleteMany({ studentEmail: user.email, semester });
    }

    const docs = grades.map((g) => ({
      studentId: user.id || null,
      studentEmail: user.email,
      studentRollNo: g.rollNo || null,
      courseCode: g.courseCode,
      courseName: g.courseName,
      credits: g.credits,
      grade: g.grade,
      semester: semester || g.semester || null,
    }));

    const created = await GradeRecord.insertMany(docs);
    res.status(201).json(created);
  } catch (err) {
    console.error("Grades bulk error:", err);
    res.status(500).json({ error: "Failed to save grades" });
  }
});

// GET /api/grades/me
router.get("/me", auth, async (req, res) => {
  try {
    const user = req.user || {};
    if (!user.email) {
      return res.status(400).json({ error: "Token does not contain email" });
    }

    const grades = await GradeRecord.find({ studentEmail: user.email })
      .sort({ createdAt: 1 })
      .lean();

    res.json(grades);
  } catch (err) {
    console.error("Grades me error:", err);
    res.status(500).json({ error: "Failed to load grades" });
  }
});

module.exports = router;

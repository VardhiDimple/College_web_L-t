const express = require("express");
const Project = require("../models/Project");
const auth = require("../middleware/auth");

const router = express.Router();

function requireFaculty(req, res, next) {
  if (!req.user || req.user.role !== "faculty") {
    return res.status(403).json({ error: "Faculty only" });
  }
  next();
}

// POST /api/projects
router.post("/", auth, requireFaculty, async (req, res) => {
  try {
    const { title, subjectCode, subjectName, description, deadline, dept, year } =
      req.body;

    if (!title || !subjectCode || !deadline) {
      return res
        .status(400)
        .json({ error: "title, subjectCode and deadline are required" });
    }

    const user = req.user || {};
    const proj = await Project.create({
      title,
      subjectCode,
      subjectName,
      description,
      deadline,
      dept,
      year,
      facultyId: user.id || null,
      facultyEmail: user.email || null,
      facultyName: user.name || (user.email ? user.email.split("@")[0] : "Faculty"),
    });

    res.status(201).json(proj);
  } catch (err) {
    console.error("Create project error:", err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// GET /api/projects?dept=CSE&year=3
router.get("/", auth, async (req, res) => {
  try {
    const { dept, year } = req.query;
    const filter = {};
    if (dept) filter.dept = dept;
    if (year) filter.year = year;

    const projects = await Project.find(filter).sort({ deadline: 1 }).lean();
    res.json(projects);
  } catch (err) {
    console.error("Get projects error:", err);
    res.status(500).json({ error: "Failed to load projects" });
  }
});

module.exports = router;

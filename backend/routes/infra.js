const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const InfraIssue = require("../models/InfraIssue");

// POST - Raise issue
router.post("/", auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) return res.status(400).json({ error: "All fields required" });

    const issue = await InfraIssue.create({
      raisedByEmail: req.user.email,
      raisedByRole: req.user.role,
      title,
      description
    });

    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET - Faculty see *all* issues / Students see *only their own*
router.get("/", auth, async (req, res) => {
  try {
    let list;
    if (req.user.role === "faculty") {
      list = await InfraIssue.find().sort({ createdAt: -1 });
    } else {
      list = await InfraIssue.find({ raisedByEmail: req.user.email }).sort({ createdAt: -1 });
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

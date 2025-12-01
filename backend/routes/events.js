const express = require("express");
const Event = require("../models/Event");
const auth = require("../middleware/auth");

const router = express.Router();

// POST /api/events
router.post("/", auth, async (req, res) => {
  try {
    const { title, date, description, targetDept = "ALL", targetYear } = req.body;
    if (!title || !date) {
      return res.status(400).json({ error: "title and date are required" });
    }

    const user = req.user || {};
    const ev = await Event.create({
      title,
      date,
      description,
      targetDept,
      targetYear,
      createdById: user.id || null,
      createdByEmail: user.email || null,
      createdByName: user.name || (user.email ? user.email.split("@")[0] : "User"),
    });

    res.status(201).json(ev);
  } catch (err) {
    console.error("Create event error:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// GET /api/events?dept=CSE&year=3
router.get("/", auth, async (req, res) => {
  try {
    const { dept, year } = req.query;
    const filter = {};

    if (dept) {
      filter.$or = [{ targetDept: dept }, { targetDept: "ALL" }];
    }
    if (year) {
      filter.$and = (filter.$and || []).concat([
        { $or: [{ targetYear: year }, { targetYear: null }, { targetYear: "" }] },
      ]);
    }

    const events = await Event.find(filter).sort({ date: 1 }).lean();
    res.json(events);
  } catch (err) {
    console.error("Get events error:", err);
    res.status(500).json({ error: "Failed to load events" });
  }
});

module.exports = router;

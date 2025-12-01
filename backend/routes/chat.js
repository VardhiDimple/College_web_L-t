const express = require("express");
const ChatMessage = require("../models/ChatMessage");
const auth = require("../middleware/auth");

const router = express.Router();

// POST /api/chat/message  { room, text }
router.post("/message", auth, async (req, res) => {
  try {
    const { room = "general", text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Message text is required" });
    }

    const user = req.user || {};
    const msg = await ChatMessage.create({
      room,
      text,
      senderId: user.id || null,
      senderEmail: user.email || null,
      senderRole: user.role || null,
      senderName: user.name || (user.email ? user.email.split("@")[0] : "User"),
    });

    res.status(201).json(msg);
  } catch (err) {
    console.error("Chat message error:", err);
    res.status(500).json({ error: "Failed to save message" });
  }
});

// GET /api/chat/messages?room=general&limit=50
router.get("/messages", auth, async (req, res) => {
  try {
    const room = req.query.room || "general";
    const limit = Number(req.query.limit) || 50;

    const msgs = await ChatMessage.find({ room })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(msgs.reverse()); // oldest first
  } catch (err) {
    console.error("Chat messages error:", err);
    res.status(500).json({ error: "Failed to load messages" });
  }
});

module.exports = router;

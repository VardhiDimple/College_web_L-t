require("dotenv").config();
const attendanceRoutes = require("./routes/attendance");
const marksRoutes = require("./routes/Mark");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/attendance", attendanceRoutes);
app.use("/api/marks", marksRoutes);

app.use("/api/auth", require("./routes/auth"));
app.use("/api/student", require("./routes/student"));
app.use("/api/faculty", require("./routes/faculty"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/events", require("./routes/events"));
app.use("/api/finance", require("./routes/finance"));
app.use("/api/grades", require("./routes/grades"));

// Simple health check
app.get("/", (req, res) => {
  res.send("College Portal API is running. Try /api/ping");
});

app.get("/api/ping", (req, res) => {
  res.json({ ok: true, message: "pong" });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 4000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

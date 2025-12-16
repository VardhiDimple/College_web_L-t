const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // ✅ ONLY THIS
  role: {
    type: String,
    enum: ["student", "faculty"],
    default: "student",
  },
  name: String,
});

module.exports = mongoose.model("User", userSchema);

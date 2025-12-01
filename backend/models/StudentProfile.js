const mongoose = require("mongoose");

const StudentProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rollNo: { type: String, unique: true },
    dept: { type: String },
    year: { type: String }, // "1".."4"
    photoUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentProfile", StudentProfileSchema);

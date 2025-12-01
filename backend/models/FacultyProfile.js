const mongoose = require("mongoose");

const FacultyProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dept: { type: String },
    designation: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FacultyProfile", FacultyProfileSchema);

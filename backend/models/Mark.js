// models/Mark.js
const mongoose = require("mongoose");

const MarkSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    maxMarks: {
      type: Number,
      required: true,
    },
    entries: [
      {
        studentEmail: { type: String, required: true },
        marks: { type: Number, required: true },
        grade: { type: String, required: true },
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mark", MarkSchema);

// backend/models/InfraIssue.js
const mongoose = require("mongoose");

const InfraIssueSchema = new mongoose.Schema(
  {
    // Who raised it
    raisedByEmail: { type: String, required: true },
    raisedByName:  { type: String },
    raisedByRole:  { type: String, enum: ["student", "faculty"], required: true },

    // Basic details
    title:       { type: String, required: true },
    description: { type: String, required: true },

    // Optional fields
    category: { type: String },                 // e.g. "Classroom", "Hostel", "Lab"
    location: { type: String },                 // e.g. "CSE Block - 3rd floor"
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    // Status fields
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    assignedTo: { type: String },              // maybe some staff email/name
    lastUpdatedBy: { type: String },           // email of last modifier
  },
  { timestamps: true }
);

module.exports = mongoose.model("InfraIssue", InfraIssueSchema);

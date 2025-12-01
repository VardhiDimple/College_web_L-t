const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String },

    createdById: { type: String },
    createdByEmail: { type: String },
    createdByName: { type: String },

    targetDept: { type: String, default: "ALL" },
    targetYear: { type: String }, // optional
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);

const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subjectCode: { type: String, required: true },
    subjectName: { type: String },
    description: { type: String },
    deadline: { type: Date, required: true },

    facultyId: { type: String },
    facultyEmail: { type: String },
    facultyName: { type: String },

    dept: { type: String },  // optional filter
    year: { type: String },  // optional filter
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);

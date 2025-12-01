const mongoose = require("mongoose");

const GradeRecordSchema = new mongoose.Schema(
  {
    studentId: { type: String },
    studentEmail: { type: String },
    studentRollNo: { type: String },

    courseCode: { type: String, required: true },
    courseName: { type: String, required: true },
    credits: { type: Number, required: true },
    grade: { type: String, required: true }, // O, A+, A, etc.
    semester: { type: String },              // "Sem 5"
  },
  { timestamps: true }
);

module.exports = mongoose.model("GradeRecord", GradeRecordSchema);

const mongoose = require("mongoose");

const FinanceRecordSchema = new mongoose.Schema(
  {
    studentId: { type: String },
    studentEmail: { type: String },
    studentRollNo: { type: String },

    term: { type: String, required: true }, // "Sem 5"
    totalFees: { type: Number, required: true },
    paid: { type: Number, default: 0 },
    remarks: { type: String },
  },
  { timestamps: true }
);

FinanceRecordSchema.virtual("due").get(function () {
  return (this.totalFees || 0) - (this.paid || 0);
});

module.exports = mongoose.model("FinanceRecord", FinanceRecordSchema);

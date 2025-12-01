const express = require("express");
const FinanceRecord = require("../models/FinanceRecord");
const auth = require("../middleware/auth");

const router = express.Router();

// POST /api/finance   (faculty/admin: create or update record)
router.post("/", auth, async (req, res) => {
  try {
    const { studentEmail, studentRollNo, term, totalFees, paid, remarks } =
      req.body;

    if (!studentEmail && !studentRollNo) {
      return res
        .status(400)
        .json({ error: "studentEmail or studentRollNo is required" });
    }
    if (!term || totalFees == null) {
      return res.status(400).json({ error: "term and totalFees are required" });
    }

    const filter = { term };
    if (studentEmail) filter.studentEmail = studentEmail;
    if (studentRollNo) filter.studentRollNo = studentRollNo;

    const record = await FinanceRecord.findOneAndUpdate(
      filter,
      { studentEmail, studentRollNo, term, totalFees, paid, remarks },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(record);
  } catch (err) {
    console.error("Finance upsert error:", err);
    res.status(500).json({ error: "Failed to save finance record" });
  }
});

// GET /api/finance/me  (student)
router.get("/me", auth, async (req, res) => {
  try {
    const user = req.user || {};
    if (!user.email) {
      return res.status(400).json({ error: "Token does not contain email" });
    }

    const records = await FinanceRecord.find({ studentEmail: user.email })
      .sort({ createdAt: 1 })
      .lean();

    res.json(
      records.map((r) => ({
        ...r,
        due: (r.totalFees || 0) - (r.paid || 0),
      }))
    );
  } catch (err) {
    console.error("Finance me error:", err);
    res.status(500).json({ error: "Failed to load finance records" });
  }
});

module.exports = router;

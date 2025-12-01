const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      enum: ["general", "faculty"],
      default: "general",
      required: true,
    },
    text: { type: String, required: true },

    senderId: { type: String },
    senderEmail: { type: String },
    senderRole: { type: String },
    senderName: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);

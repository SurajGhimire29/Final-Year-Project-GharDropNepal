const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide your email address"],
  },
  subject: {
    type: String,
    required: [true, "Please provide a subject"],
  },
  message: {
    type: String,
    required: [true, "Please provide a message"],
  },
  isRead: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

module.exports = mongoose.model("Contact", contactSchema);

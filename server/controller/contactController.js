const Contact = require("../model/contactModel");

// @desc    Submit a new contact message
// @route   POST /api/contact
// @access  Public
exports.submitMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // 1. Validation: Ensure no fields are empty
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // 2. Create the message
    // Note: Since we removed 'isAuthenticatedUser' from this route, 
    // we don't rely on req.user._id here.
    const newMessage = await Contact.create({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully!",
      data: newMessage,
    });
  } catch (error) {
    // 3. Error Handling
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Get all messages (Admin)
// @route   GET /api/admin/messages
// @access  Private/Admin
exports.getMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle isRead status (Admin)
// @route   PUT /api/admin/message/:id/read
// @access  Private/Admin
exports.toggleReadStatus = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    message.isRead = !message.isRead;
    await message.save();

    res.status(200).json({
      success: true,
      message: message.isRead ? "Marked as read" : "Marked as unread",
      data: message,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a message (Admin)
// @route   DELETE /api/admin/message/:id
// @access  Private/Admin
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

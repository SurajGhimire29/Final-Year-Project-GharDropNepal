const express = require("express");
const { submitMessage, getMessages, toggleReadStatus, deleteMessage } = require("../controller/contactController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

const router = express.Router();

// Public route for submitting a message
router.post("/contact/submit", submitMessage);

// Admin routes for managing messages
router.get("/admin/messages", isAuthenticatedUser, authorizeRoles("admin"), getMessages);
router.put("/admin/message/:id/read", isAuthenticatedUser, authorizeRoles("admin"), toggleReadStatus);
router.delete("/admin/message/:id", isAuthenticatedUser, authorizeRoles("admin"), deleteMessage);

module.exports = router;

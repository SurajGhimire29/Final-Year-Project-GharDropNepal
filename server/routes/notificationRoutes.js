const express = require("express");
const { getMyNotifications, markAsRead, deleteNotification } = require("../controller/notificationController");
const { isAuthenticatedUser } = require("../middlewares/auth");

const router = express.Router();

router.get("/notifications/me", isAuthenticatedUser, getMyNotifications);
router.put("/notification/:id/read", isAuthenticatedUser, markAsRead);
router.delete("/notification/:id", isAuthenticatedUser, deleteNotification);

module.exports = router;

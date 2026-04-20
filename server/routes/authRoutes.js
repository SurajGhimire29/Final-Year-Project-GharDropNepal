const express = require("express");
const { 
  signUp, 
  signIn, 
  signOut, 
  verifyOTP, 
  updateProfessionalProfile,
  forgotPassword, // Added
  resetPassword  // Added
} = require("../controller/authController");
const { isAuthenticatedUser } = require("../middlewares/auth");
const { getUserProfile, updateUserProfile, deleteUserProfile, updateAvatar, toggleAvailability} = require("../controller/user/userController");
const { upload } = require("../utils/cloudinary"); 
const authRouter = express.Router();

// --- 1. SIGNUP & AUTHENTICATION ---
authRouter.post(
  "/signup", 
  upload.fields([
    { name: "storeImage", maxCount: 1 }, 
    { name: "deliveryLicenseImage", maxCount: 1 }
  ]), 
  signUp
);

authRouter.post("/signin", signIn);
authRouter.get("/signout", signOut); 
authRouter.post("/emailotpverification", verifyOTP);

// --- 2. PASSWORD RECOVERY (NEW) ---
// Route to request an OTP via email
authRouter.post("/forgot-password", forgotPassword);

// Route to verify OTP and set a new password
authRouter.post("/reset-password", resetPassword);

// --- 3. PROFILE & IDENTITY ---
authRouter.get("/me", isAuthenticatedUser, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user, 
  });
});

authRouter.get("/user/profile", isAuthenticatedUser, getUserProfile);
authRouter.put("/user/update", isAuthenticatedUser, updateUserProfile);

authRouter.put(
  "/user/update-avatar", 
  isAuthenticatedUser, 
  upload.fields([
    { name: "avatar", maxCount: 1 }, 
    { name: "storeImage", maxCount: 1 }
  ]), 
  updateAvatar
);

// --- 4. ACCOUNT ACTIONS ---
authRouter.delete("/user/delete", isAuthenticatedUser, deleteUserProfile);

// --- 5. PROFESSIONAL VERIFICATION (POST-SIGNUP) ---
authRouter.put(
  "/update-professional-profile", 
  isAuthenticatedUser, 
  upload.fields([
    { name: "storeImage", maxCount: 1 }, 
    { name: "businessLicense", maxCount: 1 }, 
    { name: "deliveryLicenseImage", maxCount: 1 }
  ]), 
  updateProfessionalProfile
);

authRouter.put("/delivery/availability", isAuthenticatedUser, toggleAvailability);

module.exports = authRouter;
const express = require("express");
const { signUp, signIn, signOut, verifyOTP, updateProfessionalProfile } = require("../controller/authController");
const { isAuthenticatedUser } = require("../middlewares/auth");
const { getUserProfile, updateUserProfile, deleteUserProfile, updateAvatar } = require("../controller/user/userController");
const { upload } = require("../utils/cloudinary"); // Your multer/cloudinary config
const authRouter = express.Router();

// --- 1. SIGNUP WITH IMAGE HANDLING ---
// We use .fields() to allow either storeImage OR deliveryLicenseImage to be sent in the same request
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

// --- 2. PROFILE & IDENTITY ---
authRouter.get("/me", isAuthenticatedUser, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user, 
  });
});

authRouter.get("/user/profile", isAuthenticatedUser, getUserProfile);
authRouter.put("/user/update", isAuthenticatedUser, updateUserProfile);
authRouter.put("/user/update-avatar", isAuthenticatedUser, upload.single("avatar"), updateAvatar);

// --- 3. ACCOUNT ACTIONS ---
authRouter.delete("/user/delete", isAuthenticatedUser, deleteUserProfile);

// --- 4. PROFESSIONAL VERIFICATION (POST-SIGNUP) ---
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

module.exports = authRouter;
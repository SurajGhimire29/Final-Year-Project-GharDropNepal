const express = require("express");
const bannerRouter = express.Router();
const { 
  createBanner, 
  getAllBanners, 
  deleteBanner, 
  toggleBannerStatus,
  requestBanner,        // Added for Vendors
  getPendingRequests,   // Added for Admin
  handleBannerRequest   // Added for Admin Approval
} = require("../controller/banner/bannerController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const { upload } = require("../utils/cloudinary");

// --- 1. PUBLIC ROUTE ---
bannerRouter.get("/banners", getAllBanners);

// --- 2. VENDOR PROTECTED ROUTES ---
// This fixes your 403 error for the /vendor/banners/request endpoint
bannerRouter.post(
  "/vendor/banners/request", 
  isAuthenticatedUser, 
  authorizeRoles("vendor"), 
  upload.single("image"), // Key must match frontend FormData
  requestBanner
);

// --- 3. ADMIN PROTECTED ROUTES ---

// Admin: Manage Live Banners
bannerRouter.post(
  "/admin/banners/add", 
  isAuthenticatedUser, 
  authorizeRoles("admin"), 
  upload.single("image"), 
  createBanner
);

bannerRouter.delete(
  "/admin/banners/:id", 
  isAuthenticatedUser, 
  authorizeRoles("admin"), 
  deleteBanner
);

bannerRouter.put(
  "/admin/banners/toggle/:id", 
  isAuthenticatedUser, 
  authorizeRoles("admin"), 
  toggleBannerStatus
);

// Admin: Manage Vendor Requests
bannerRouter.get(
  "/admin/banners/requests", 
  isAuthenticatedUser, 
  authorizeRoles("admin"), 
  getPendingRequests
);

bannerRouter.put(
  "/admin/banners/request/:id", 
  isAuthenticatedUser, 
  authorizeRoles("admin"), 
  handleBannerRequest
);

module.exports = bannerRouter;
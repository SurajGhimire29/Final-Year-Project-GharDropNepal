const Banner = require("../../model/bannerModel");

/**
 * @desc    Get all APPROVED and ACTIVE banners for the frontend slider
 * @route   GET /banners
 */
exports.getAllBanners = async (req, res) => {
  try {
    // IMPORTANT: Now we filter by both status AND isActive
    const banners = await Banner.find({ 
      status: "approved", 
      isActive: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: banners.length,
      banners,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Vendor: Request a new banner
 * @route   POST /vendor/banners/request
 */
exports.requestBanner = async (req, res) => {
  try {
    const { badge, title, desc } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Upload an image" });
    }

    const banner = await Banner.create({
      badge,
      title,
      desc,
      image: req.file.path,
      vendor: req.user._id, // From your auth middleware
      shopName: req.user.fullName, // Assuming fullName is in your User model
      status: "pending", // Always pending for vendors
      isActive: false,   // Hidden until approved
    });

    res.status(201).json({
      success: true,
      message: "Banner request sent to Admin!",
      banner,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Admin: Get all pending vendor requests
 * @route   GET /admin/banners/requests
 */
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await Banner.find({ status: "pending" }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin: Approve or Reject a request
 * @route   PUT /admin/banners/request/:id
 */
exports.handleBannerRequest = async (req, res) => {
  try {
    const { status } = req.body; // Expecting "approved" or "rejected"
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    banner.status = status;
    
    // If approved, make it active immediately
    if (status === "approved") {
      banner.isActive = true;
    }

    await banner.save();

    res.status(200).json({
      success: true,
      message: `Banner request ${status} successfully`,
      banner,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Your existing Admin functions (Keep them below) ---
exports.createBanner = async (req, res) => { 
    /* Set status: "approved" by default for Admin */ 
    // ... logic ...
    const banner = await Banner.create({
      // ... same as before
      status: "approved", 
      isActive: true 
    });
};
/**
 * @desc    Delete a banner (Admin Only)
 * @route   DELETE /admin/banners/:id
 * @access  Private
 */
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    await banner.deleteOne();

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting banner",
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle banner visibility (Admin Only)
 * @route   PUT /admin/banners/toggle/:id
 * @access  Private
 */
exports.toggleBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // Flip the boolean value
    banner.isActive = !banner.isActive;
    await banner.save();

    res.status(200).json({
      success: true,
      message: `Banner is now ${banner.isActive ? "Active" : "Hidden"}`,
      banner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating banner status",
      error: error.message,
    });
  }
};
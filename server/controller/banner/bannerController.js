const Banner = require("../../model/bannerModel");
const Withdrawal = require("../../model/withDrawModel");
const Notification = require("../../model/notificationModel");
const Order = require("../../model/orderModel");

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
    const vendorId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Upload an image" });
    }

    const BANNER_FEE = 500;

    // 1. Calculate Vendor's Current Balance
    const orders = await Order.find({ "items.vendor": vendorId, shippingStatus: "Delivered" });
    let totalEarned = 0;
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.vendor.toString() === vendorId.toString()) {
          totalEarned += (item.price * item.quantity) * 0.90;
        }
      });
    });

    const Withdrawal = require("../../model/withDrawModel");
    const transactions = await Withdrawal.find({ vendor: vendorId });
    const totalWithdrawnOrRequested = transactions
      .filter(t => t.status === "Completed" || t.status === "Pending")
      .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = totalEarned - totalWithdrawnOrRequested;
    const hasEnoughBalance = currentBalance >= BANNER_FEE;

    // 2. Create the Banner Request
    const banner = await Banner.create({
      badge,
      title,
      desc,
      image: req.file.path,
      vendor: vendorId,
      shopName: req.user.fullName,
      status: "pending",
      isActive: false,
    });

    // 3. Create the Transaction record
    const feeTransaction = await Withdrawal.create({
      vendor: vendorId,
      amount: BANNER_FEE,
      status: hasEnoughBalance ? "Completed" : "Unpaid", // New status "Unpaid"
      type: "Banner Fee",
      paidAt: hasEnoughBalance ? Date.now() : null
    });

    // 4. If enough balance, update the User's ledger immediately
    if (hasEnoughBalance) {
      const User = require("../../model/userModel");
      await User.findByIdAndUpdate(vendorId, {
        $inc: { totalWithdrawn: BANNER_FEE }
      });
    }

    banner.withdrawal = feeTransaction._id;
    await banner.save();

    // 5. Notify Vendor
    await Notification.create({
      user: vendorId,
      title: "Banner Request Received",
      message: hasEnoughBalance 
        ? `Rs. ${BANNER_FEE} has been deducted from your balance for this request.`
        : `Request received. Since your balance is low, Rs. ${BANNER_FEE} will be charged as pending debt.`,
      type: "banner"
    });

    res.status(201).json({
      success: true,
      message: hasEnoughBalance 
        ? "Banner requested! Fee deducted from your current balance."
        : "Banner requested! Fee marked as pending due to low balance.",
      banner,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getPendingCount = async (req, res) => {
  try {
    const count = await Banner.countDocuments({ status: "pending" });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin: Get all pending vendor requests
 * @route   GET /admin/banners/requests
 */
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await Banner.find({ status: "pending" })
      .populate("withdrawal")
      .sort({ createdAt: -1 });

    const formattedRequests = requests.map(req => ({
      ...req._doc,
      paymentStatus: req.withdrawal?.status || 'Unpaid'
    }));

    res.status(200).json({ success: true, requests: formattedRequests });
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
    const { status } = req.body; 
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    banner.status = status;
    
    // Update the associated fee transaction
    if (banner.withdrawal) {
      const withdrawal = await Withdrawal.findById(banner.withdrawal);
      if (withdrawal) {
        if (status === "approved") {
          // IMPORTANT: Only mark as 'Completed' if it wasn't a debt (Unpaid)
          // If it was 'Unpaid', it stays 'Unpaid' so it remains a debt in the ledger.
          if (withdrawal.status !== "Unpaid") {
            withdrawal.status = "Completed";
            withdrawal.paidAt = Date.now();
            
            // Update user's totalWithdrawn ledger only for actual deductions
            const User = require("../../model/userModel");
            await User.findByIdAndUpdate(banner.vendor, {
              $inc: { totalWithdrawn: withdrawal.amount }
            });
          }
        } else if (status === "rejected") {
          withdrawal.status = "Rejected";
        }
        await withdrawal.save();
      }
    }

    if (status === "approved") {
      banner.isActive = true;
    }

    await banner.save();

    // Notify Vendor
    await Notification.create({
      user: banner.vendor,
      title: `Banner Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: status === "approved" 
        ? "Your banner is now live! The fee has been deducted from your earnings." 
        : "Your banner request was rejected. No fee will be deducted.",
      type: "banner"
    });

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
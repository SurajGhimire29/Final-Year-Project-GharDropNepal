// backend/controllers/adminController.js
const User = require("../../model/userModel");
const Product = require("../../model/productModel");

/**
 * @desc    Get Admin Dashboard Stats
 * @route   GET /admin/stats
 */
exports.getAdminStats = async (req, res) => {
  try {
    const [userCount, productCount, vendorCount, deliveryCount] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      Product.countDocuments(),
      User.countDocuments({ role: "vendor" }),
      User.countDocuments({ role: "deliveryBoy" }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers: userCount,
        totalProducts: productCount,
        totalVendors: vendorCount,
        totalDelivery: deliveryCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all users (with optional role filtering)
 * @route   GET /admin/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    /**
     * LOGIC: 
     * If a role is provided, we use a Case-Insensitive Regular Expression.
     * This way, "deliveryBoy" in your Schema will match "deliveryBoy" or "deliveryboy" from the Frontend.
     */
    const query = role 
      ? { role: { $regex: new RegExp(`^${role}$`, "i") } } 
      : {};

    // DEBUG: Check what the backend is actually searching for
    console.log("Searching for Role:", role || "All Users");

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .select("-password -__v");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server error while fetching user details." 
    });
  }
};
/**
 * @desc    Remove/Delete a User
 * @route   DELETE /admin/user/:id
 */
exports.removeUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Security: Prevent self-deletion or deleting other admins
    if (user.role === "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Action Denied: Admin accounts cannot be removed." 
      });
    }

    // CLEANUP LOGIC:
    // If Vendor: Delete all their products
    if (user.role === "vendor") {
      await Product.deleteMany({ user: user._id }); 
    }

    // Note: If you have an Order model, you might want to prevent deletion 
    // if there are active orders, or mark the user as 'deleted' instead.

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: `${user.fullName} has been removed from GharDrop.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get pending professional applications
 * @route   GET /admin/pending-approvals
 */
// backend/controller/admin/adminController.js

exports.getPendingApprovals = async (req, res) => {
  try {
    // Find users who are verified (email/OTP done) but not yet approved by admin
    const pendingUsers = await User.find({
      isVerified: true, 
      $or: [
        { role: "vendor", vendorStatus: "pending" },
        { role: "deliveryBoy", deliveryStatus: "pending" }
      ]
    }).select("-password");

    res.status(200).json({
      success: true,
      count: pendingUsers.length,
      pendingUsers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// backend/controller/admin/adminController.js

exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "approved" or "rejected"

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "vendor") {
      user.vendorStatus = status;
    } else if (user.role === "deliveryBoy") {
      user.deliveryStatus = status;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `User has been ${status} successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

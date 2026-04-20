const User = require("../../model/userModel");
const Order = require("../../model/orderModel")
const cloudinary = require("cloudinary").v2;

// @desc    Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update User Avatar (Profile Picture)
exports.updateAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // 1. If user already has an avatar, delete the old one from Cloudinary first
    if (user.avatar && user.avatar.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    // 2. Upload the new image
    // req.file.path comes from Multer middleware
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "ghardrop_avatars",
      width: 250,
      crop: "scale",
    });

    // 3. Update user record in Database
    user.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully!",
      avatar: user.avatar,
    });
  } catch (error) {
    console.error("Cloudinary Error:", error);
    res.status(500).json({ success: false, message: "Image upload failed" });
  }
};

// @desc    Update Profile Details (Name, Phone)
exports.updateUserProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, phoneNumber },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Deactivate Account
exports.deleteUserProfile = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isVerified: false }); // Or soft delete logic
    res.cookie("token", null, { expires: new Date(0), httpOnly: true });
    res.status(200).json({ success: true, message: "Account deactivated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    // 1. Find the user (req.user._id comes from your auth middleware)
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2. Role Check (Safety first!)
    if (user.role !== "deliveryBoy") {
      return res.status(403).json({ 
        success: false, 
        message: "Only delivery riders can change availability status." 
      });
    }

    // 3. Update the field
    user.isAvailable = isAvailable;
    await user.save();

    res.status(200).json({
      success: true,
      message: `You are now ${isAvailable ? "Online" : "Offline"}`,
      isAvailable: user.isAvailable,
    });
  } catch (error) {
    console.error("Availability Toggle Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getVendorStats = async (req, res) => {
  try {
    const freshUser = await User.findById(req.user._id).select("totalWithdrawn");

    // FIX: Look for orders where the "items" array contains an item belonging to this vendor
    const orders = await Order.find({ 
      "items.vendor": req.user._id 
    }).sort({ createdAt: -1 });

    // FIX: Calculate 90% only from the items that belong to THIS vendor
    const totalEarnings = orders
      .filter(o => o.shippingStatus === "Delivered")
      .reduce((sum, order) => {
        // Find the specific items in this order that belong to this vendor
        const vendorItemsSubtotal = order.items
          .filter(item => item.vendor.toString() === req.user._id.toString())
          .reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
          
        return sum + (vendorItemsSubtotal * 0.90);
      }, 0);

    res.status(200).json({
      success: true,
      orders,
      stats: {
        totalEarnings: Math.round(totalEarnings),
        totalWithdrawn: freshUser?.totalWithdrawn || 0 
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
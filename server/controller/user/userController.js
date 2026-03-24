const User = require("../../model/userModel");
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
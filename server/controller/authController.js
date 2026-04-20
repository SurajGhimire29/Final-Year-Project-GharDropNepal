const bcrypt = require("bcryptjs");
const User = require("../model/userModel");
const { cloudinary } = require("../utils/cloudinary");
const sendOTPEmail = require("../utils/nodemailer");
const newToken = require("../utils/token");


// @desc    Register a new user & Send OTP
// @route   POST /signup
const signUp = async (req, res) => {
    try {
        const { 
            fullName, email, password, phoneNumber, role,
            storeName, storeAddress, 
            vehicleType, vehicleNumber, licenseNumber 
        } = req.body;

        const cleanEmail = email.toLowerCase().trim();
        
        // 1. Check if user exists
        let user = await User.findOne({ email: cleanEmail });
        if (user && user.isVerified) {
            return res.status(400).json({ success: false, message: "User already exists. Please Login." });
        }

        // 2. Handle Image Uploads Safely
        let storeImageData = null;
        let deliveryLicenseImageData = null;

        if (req.files) {
            // Check for Vendor Image safely using Optional Chaining
            if (req.files?.storeImage?.[0]) {
                const result = await cloudinary.uploader.upload(req.files.storeImage[0].path, {
                    folder: "ghardrop/vendors",
                });
                storeImageData = { public_id: result.public_id, url: result.secure_url };
            }

            // Check for Delivery License safely
            if (req.files?.deliveryLicenseImage?.[0]) {
                const result = await cloudinary.uploader.upload(req.files.deliveryLicenseImage[0].path, {
                    folder: "ghardrop/delivery",
                });
                deliveryLicenseImageData = { public_id: result.public_id, url: result.secure_url };
            }
        }

        // 3. Security & OTP
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000;

        // 4. Create the User Data Object
        const userData = { 
            fullName, 
            email: cleanEmail,
            phoneNumber, 
            password: hashedPassword,
            role, 
            otp, 
            otpExpires, 
            isVerified: false 
        };

        if (role === 'vendor') {
            userData.storeName = storeName;
            userData.storeAddress = storeAddress;
            userData.storeImage = storeImageData; // Will be null if no image was uploaded
            userData.vendorStatus = 'pending';
        }

        if (role === 'deliveryBoy') {
            userData.vehicleType = vehicleType;
            userData.vehicleNumber = vehicleNumber;
            userData.licenseNumber = licenseNumber;
            userData.deliveryLicenseImage = deliveryLicenseImageData;
            userData.deliveryStatus = 'pending';
        }

        // 5. Database Save (Upsert ensures we update the OTP if they try again)
        await User.findOneAndUpdate(
            { email: cleanEmail },
            { $set: userData },
            { upsert: true, new: true }
        );

        // 6. Send OTP (Wrapped in a try-catch so it doesn't crash the whole process)
        try {
            await sendOTPEmail(cleanEmail, otp);
        } catch (emailErr) {
            console.error("Email Service Error:", emailErr);
            // Optionally: return res.status(500).json({message: "Failed to send OTP"});
        }

        res.status(200).json({ success: true, message: "OTP sent to your email." });

    } catch (error) {
        // IMPORTANT: Look at your Node.js terminal/console to see this log!
        console.error("SIGNUP CRASH ERROR:", error); 
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Verify OTP and activate account
// @route   POST /emailotpverification
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const cleanEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: cleanEmail });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const isMatch = String(user.otp) === String(otp);
        const isExpired = user.otpExpires < Date.now();

        if (!isMatch || isExpired) {
            return res.status(400).json({ 
                success: false, 
                message: isExpired ? "OTP has expired." : "Invalid OTP code." 
            });
        }

        const updatedUser = await User.findOneAndUpdate(
            { email: cleanEmail },
            { $set: { isVerified: true }, $unset: { otp: 1, otpExpires: 1 } },
            { new: true } 
        );

        const token = await newToken(updatedUser._id);
        
        // Cookie setup
        res.cookie("token", token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production", 
            sameSite: "none", 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        return res.status(200).json({
            success: true,
            message: "Email verified successfully!",
            user: {
                _id: updatedUser._id,
                fullName: updatedUser.fullName,
                role: updatedUser.role,
                vendorStatus: updatedUser.vendorStatus || null
            }
        });
    } catch (error) {
        console.error("Verification Error:", error);
        return res.status(500).json({ success: false, message: "Verification error" });
    }
};

// @desc    Upload Professional Images (Store/License)
// @route   PUT /update-professional-profile
const updateProfessionalProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id); // Requires auth middleware
        if (!user) return res.status(404).json({ message: "User not found" });

        const updates = {};

        // 1. Vendor Image Handling
        if (req.files?.storeImage) {
            const result = await cloudinary.uploader.upload(req.files.storeImage[0].path, { folder: "ghardrop/stores" });
            updates.storeImage = { public_id: result.public_id, url: result.secure_url };
        }
        if (req.files?.businessLicense) {
            const result = await cloudinary.uploader.upload(req.files.businessLicense[0].path, { folder: "ghardrop/licenses" });
            updates.businessLicense = { public_id: result.public_id, url: result.secure_url };
        }

        // 2. Delivery Boy Image Handling
        if (req.files?.deliveryLicenseImage) {
            const result = await cloudinary.uploader.upload(req.files.deliveryLicenseImage[0].path, { folder: "ghardrop/delivery" });
            updates.deliveryLicenseImage = { public_id: result.public_id, url: result.secure_url };
        }

        const updatedUser = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });

        res.status(200).json({ 
            success: true, 
            message: "Documents uploaded successfully. Pending admin approval.", 
            user: updatedUser 
        });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ success: false, message: "Upload failed", error: error.message });
    }
};

// @desc    Standard Sign In
// @route   POST /signin
const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const cleanEmail = email.toLowerCase().trim();

        // 1. Find user and include password
        const user = await User.findOne({ email: cleanEmail }).select("+password");
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        // 2. Check basic email verification (OTP)
        if (!user.isVerified) {
            return res.status(401).json({ 
                success: false, 
                message: "Please verify your email via OTP first." 
            });
        }

        // 3. ADMIN APPROVAL GATEKEEPER
        // Handle Vendors
        if (user.role === "vendor") {
            if (user.vendorStatus === "pending") {
                return res.status(403).json({ message: "Your store is pending admin approval. We will notify you via email soon." });
            }
            if (user.vendorStatus === "rejected") {
                return res.status(403).json({ message: "Your vendor application was rejected. Please contact support." });
            }
        }

        // Handle Delivery Boys
        if (user.role === "deliveryBoy") {
            if (user.deliveryStatus === "pending") {
                return res.status(403).json({ message: "Your delivery profile is under review. You can log in once approved." });
            }
            if (user.deliveryStatus === "rejected") {
                return res.status(403).json({ message: "Your delivery application was rejected." });
            }
        }

        // 4. Generate Token
        const token = await newToken(user._id);
        
        // 5. Setup Cookie Options
        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("token", token, { 
            httpOnly: true, 
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        });

        // 6. Send Response (Include relevant statuses)
        return res.status(200).json({
            success: true,
            message: `Welcome back, ${user.fullName}`,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                vendorStatus: user.vendorStatus,
                deliveryStatus: user.deliveryStatus // Added for frontend context
            }
        });

    } catch (error) {
        console.error("Signin Error:", error);
        return res.status(500).json({ success: false, message: "Sign in error" });
    }
};

// @desc    Sign Out
const signOut = async (req, res) => {
    res.cookie("token", "", { 
        expires: new Date(0), 
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/" 
    });
    return res.status(200).json({ success: true, message: "Logged out successfully" });
};
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Please provide an email." });
        }

        const cleanEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: cleanEmail });

        // Security Tip: Even if user doesn't exist, we usually send a 200 to prevent "Email Enumeration"
        // But for development clarity, we'll return 404 here.
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found with this email." });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Set expiry for 10 minutes
        const otpExpires = Date.now() + 10 * 60 * 1000;

        // Save OTP to user record
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send Email
        try {
            await sendOTPEmail(cleanEmail, otp);
            res.status(200).json({ 
                success: true, 
                message: "A 6-digit reset code has been sent to your email." 
            });
        } catch (emailErr) {
            console.error("Email Error:", emailErr);
            res.status(500).json({ success: false, message: "Failed to send email. Try again later." });
        }

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// @desc    Reset Password using OTP
// @route   POST /reset-password
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const cleanEmail = email.toLowerCase().trim();
        
        // Find user with valid OTP and verify it hasn't expired
        const user = await User.findOne({ 
            email: cleanEmail,
            otp: otp,
            otpExpires: { $gt: Date.now() } // Must be greater than current time
        });

        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid OTP or the code has expired. Please request a new one." 
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear OTP fields
        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: "Password reset successful! You can now log in with your new password." 
        });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


module.exports = { 
    signUp, 
    verifyOTP, 
    updateProfessionalProfile, 
    signIn, 
    signOut,
    forgotPassword,
    resetPassword 
};
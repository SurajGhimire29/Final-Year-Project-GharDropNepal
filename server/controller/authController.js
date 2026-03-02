const bcrypt = require("bcryptjs");
const User = require("../model/userModel");
const newToken = require("../utils/token");
const sendOTPEmail = require("../utils/nodemailer");

// @desc    Register a new user & Send OTP
// @route   POST /signup
const signUp = async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, role } = req.body;

        // 1. Validation & Normalization
        const cleanEmail = email.toLowerCase().trim();
        
        let user = await User.findOne({ email: cleanEmail });
        if (user && user.isVerified) {
            return res.status(400).json({ message: "User already exists and is verified. Please Login." });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }

        // 2. Prepare Data
        const validRoles = ['customer', 'vendor', 'deliveryBoy'];
        const selectedRole = validRoles.includes(role) ? role : 'customer';
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        // 4. ATOMIC UPSERT
        // This creates the user if they don't exist, or updates them if they do.
        await User.findOneAndUpdate(
            { email: cleanEmail },
            { 
                fullName,
                phoneNumber,
                password: hashedPassword,
                role: selectedRole,
                otp: otp,
                otpExpires: otpExpires,
                isVerified: false 
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // 5. Send the Email
        await sendOTPEmail(cleanEmail, otp);

        return res.status(200).json({
            success: true,
            message: "OTP sent to your email. Please verify to complete registration."
        });

    } catch (error) {
        console.error("Signup Error:", error);
        return res.status(500).json({
            success: false,
            message: "Sign up error",
            error: error.message
        });
    }
};

// @desc    Verify OTP and activate account
// @route   POST /emailotpverification
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const cleanEmail = email.toLowerCase().trim();

        // 1. Find user first to check OTP
        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 2. Strict OTP and Expiry Check
        // Converting both to String handles Number vs String mismatches
        const isMatch = String(user.otp) === String(otp);
        const isExpired = user.otpExpires < Date.now();

        if (!isMatch || isExpired) {
            return res.status(400).json({
                success: false,
                message: isExpired ? "OTP has expired." : "Invalid OTP code."
            });
        }

        // 3. ATOMIC UPDATE
        // Using findOneAndUpdate ensures the change is saved immediately
        const updatedUser = await User.findOneAndUpdate(
            { email: cleanEmail },
            { 
                $set: { isVerified: true }, 
                $unset: { otp: 1, otpExpires: 1 } 
            },
            { new: true } 
        );

        if (!updatedUser) {
            throw new Error("Failed to update user verification status");
        }

        // 4. Create Token for Automatic Login
        const token = await newToken(updatedUser._id);

        res.cookie("token", token, {
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });

        return res.status(200).json({
            success: true,
            message: "Email verified successfully!",
            user: {
                _id: updatedUser._id,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });
    } catch (error) {
        console.error("Verification Error:", error);
        return res.status(500).json({
            success: false,
            message: "OTP Verification error",
            error: error.message
        });
    }
};

// @desc    Standard Sign In
// @route   POST /signin
const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const cleanEmail = email.toLowerCase().trim();

        let user = await User.findOne({ email: cleanEmail }).select("+password");
        
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        // 5. Verification Status Check
        if (!user.isVerified) {
            return res.status(401).json({ 
                success: false,
                message: "Your email is not verified. Please verify your OTP first." 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        const token = await newToken(user._id);

        res.cookie("token", token, {
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });

        return res.status(200).json({
            success: true,
            message: `Welcome back, ${user.fullName}`,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Signin Error:", error);
        return res.status(500).json({
            success: false,
            message: "Sign in error",
            error: error.message
        });
    }
};

// @desc    Log Out
// @route   GET /signout
const signOut = async (req, res) => {
    try {
        res.cookie("token", "", {
            expires: new Date(0),
            httpOnly: true
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Sign out error",
            error: error.message
        });
    }
};

module.exports = {
    signUp,
    verifyOTP,
    signIn,
    signOut
};
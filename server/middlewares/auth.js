const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

exports.isAuthenticatedUser = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ message: "Login first to access this resource" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        next();
    } catch (error) {
        res.status(401).json({ message: "Authentication failed" });
    }
};

// middleware/auth.js
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // Convert the incoming role from DB to lowercase to ensure match
        const userRole = req.user?.role?.toLowerCase();
        
        // Convert all allowed roles in the array to lowercase too
        const allowedRoles = roles.map(role => role.toLowerCase());

        if (!req.user || !allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false, // Adding success flag for frontend consistency
                message: `Role (${req.user?.role || 'unknown'}) is not allowed to access this resource`
            });
        }
        next();
    };
};
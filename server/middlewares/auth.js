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
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role (${req.user ? req.user.role : 'unknown'}) is not allowed to access this resource`
            });
        }
        next();
    };
};
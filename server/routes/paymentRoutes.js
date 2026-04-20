const express = require("express");
const router = express.Router();

// 1. Controller Import (Ensure the folder name is 'controller' or 'controllers' as per your project)
const { 
    initiateKhaltiPayment, 
    verifyKhaltiPayment 
} = require("../controller/payment/paymentController"); 

// 2. Authentication Middleware
const { isAuthenticatedUser } = require("../middlewares/auth");

/**
 * @route   POST /api/v1/payment/initiate
 * @desc    Initialize Khalti payment and return pidx + payment_url
 * @access  Private (Logged in users only)
 */
router.post("/initiate", isAuthenticatedUser, initiateKhaltiPayment);

/**
 * @route   POST /api/v1/payment/verify
 * @desc    Verify Khalti payment status using pidx
 * @access  Private
 * @note    Changed to POST because it updates the Order/Payment status in DB
 */
router.post("/verify", isAuthenticatedUser, verifyKhaltiPayment);

module.exports = router;
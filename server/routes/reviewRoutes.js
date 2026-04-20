const express = require('express');
const router = express.Router();
const { createProductReview } = require('../controller/review/reviewController');
const { isAuthenticatedUser } = require('../middlewares/auth'); // Your auth middleware

// Use PUT because it creates OR updates
router.route('/product/:id/review').post(isAuthenticatedUser, createProductReview);

module.exports = router;
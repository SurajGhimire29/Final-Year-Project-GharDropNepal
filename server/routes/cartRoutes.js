const express = require('express');
const router = express.Router();

// Import Controllers
const { 
    addToCart, 
    getCart, 
    removeItem, 
    updateQuantity, 
    clearCart 
} = require('../controller/cart/cartController');

// Import Middleware
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth'); 

// 1. Ensure the person is logged in
router.use(isAuthenticatedUser);

// 2. Ensure the person logged in has the role of 'user' (Customer)
// This blocks Vendors and Admins from accessing these specific customer cart routes
router.use(authorizeRoles('customer'));

// --- ROUTES ---

// GET user cart
router.route('/getCart').get(getCart);

// ADD item to cart
router.route('/addCart').post(addToCart);


// UPDATE item quantity
router.route('/updateCart').put(updateQuantity);

// DELETE single item from cart via ID
router.route('/deleteCart/:id').delete(removeItem);

// CLEAR entire cart
router.route('/clearCart').delete(clearCart);

module.exports = router;
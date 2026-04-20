const express = require("express");
const router = express.Router();
const { 
    createOrder, 
    getMyOrders, 
    getOrderDetails,
    getVendorOrders,            // New: Admin Controller
    getDeliveryBoyOrders,
    updateLocation,
    getActiveOrder,
    getSingleOrder,
    updateOrderStatus
} = require("../controller/order/orderController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const { requestPayout, requestVendorPayout, getVendorEarningsStats } = require("../controller/withdraw/withdrawController");
const { getVendorStats } = require("../controller/user/userController");

// --- GLOBAL PROTECT ---
// All order routes require the user to be logged in
router.use(isAuthenticatedUser);

// --- CUSTOMER ROUTES ---
router.post("/order/new", createOrder);
router.get("/orders/my-orders", getMyOrders);

// --- VENDOR ROUTES ---
router.get("/vendor/orders", authorizeRoles("vendor"), getVendorOrders);

// --- ADMIN ROUTES ---
// Only users with the 'admin' role can access these
// router.get("/admin/orders", authorizeRoles("admin"), getAllOrders);


// Admin can update any order (e.g., manual status change) or delete one
// router.route("/admin/order/:id")
//     .put(authorizeRoles("admin"), updateOrder)
//     .delete(authorizeRoles("admin"), deleteOrder);

// --- SHARED ROUTES ---
// Both Customer, Vendor, and Admin can see specific details
// The controller should check if the requester owns the order or is an admin/vendor
router.get("/order/:id", getOrderDetails);

router.get("/delivery/my-orders", isAuthenticatedUser, authorizeRoles("deliveryBoy"), getDeliveryBoyOrders);

router.route('/location').put(isAuthenticatedUser, authorizeRoles('deliveryBoy'), updateLocation);

router.route('/user/active-order').get(isAuthenticatedUser, getActiveOrder);

router.route('/delivery/order-details/:id').get(isAuthenticatedUser, authorizeRoles('deliveryBoy') ,getSingleOrder);

// Rider updates status (e.g., 'Picked Up' -> 'Out for Delivery' -> 'Delivered')
router.route('/delivery/order/:id')
    .put(isAuthenticatedUser, authorizeRoles('deliveryBoy'), updateOrderStatus);

    router.post('/request-payout', isAuthenticatedUser, authorizeRoles('deliveryBoy'), requestPayout);
    router.post('/vendor/request-payout', isAuthenticatedUser, authorizeRoles('vendor'), requestVendorPayout);

router.route('/vendor/stats').get(
    isAuthenticatedUser, 
    authorizeRoles('vendor'), // Optional: ensure only vendors access this
    getVendorStats
);

    // Vendor Payout Request
router.get("/vendor/earnings-stats", isAuthenticatedUser, authorizeRoles("vendor"), getVendorEarningsStats);
router.post("/vendor/withdraw", isAuthenticatedUser, authorizeRoles("vendor"), requestVendorPayout);

module.exports = router;
const express = require("express");
const router = express.Router();
const { 
  getAdminStats, 
  getAllUsers, 
  getPendingApprovals, 
  approveUser, 
  removeUser, 
  getAvailableRiders,
  getPendingDispatchOrders,
  getSalesTrend,
  getPartnerReports
} = require("../controller/admin/adminController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const { dispatchOrder } = require("../controller/order/orderController");
const { getWithdrawalRequests, updateWithdrawalStatus } = require("../controller/withdraw/withdrawController");

// Middleware to log requests for debugging
router.use((req, res, next) => {
  console.log(`--- Admin Route: ${req.method} ${req.url} ---`);
  next();
});

// 1. Stats
router.get("/admin/stats", isAuthenticatedUser, authorizeRoles("admin"), getAdminStats);

// 2. Fetch Users
router.get("/admin/fetch-all-customers", isAuthenticatedUser, authorizeRoles("admin"), getAllUsers);

// 3. Verification Hub: Fetch Pending
router.get("/admin/pending-approvals", isAuthenticatedUser, authorizeRoles("admin"), getPendingApprovals);

// 4. Verification Hub: Approve/Reject (MUST BE PUT)
router.put("/admin/approve-user/:id", isAuthenticatedUser, authorizeRoles("admin"), approveUser);

// 5. Remove User
router.delete("/admin/user/remove/:id", isAuthenticatedUser, authorizeRoles("admin"), removeUser);

router.get("/admin/delivery-boys/active", isAuthenticatedUser, authorizeRoles("admin"), getAvailableRiders);

router.get("/admin/orders/pending-dispatch", isAuthenticatedUser, authorizeRoles("admin"), getPendingDispatchOrders);

router.route('/admin/order-dispatch').put(isAuthenticatedUser, authorizeRoles('admin'), dispatchOrder);

router.get("/admin/sales-trend", isAuthenticatedUser, authorizeRoles('admin'), getSalesTrend);

router.get("/admin/reports", isAuthenticatedUser, authorizeRoles('admin'), getPartnerReports);

router.get("/admin/withdrawals", isAuthenticatedUser, authorizeRoles('admin'), getWithdrawalRequests);
router.put("/admin/withdrawal/:id", isAuthenticatedUser, authorizeRoles('admin'), updateWithdrawalStatus);


module.exports = router;
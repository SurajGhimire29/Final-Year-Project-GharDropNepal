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



// 1. Dashboard Statistics
router.get("/admin/stats", isAuthenticatedUser, authorizeRoles("admin"), getAdminStats);

// 2. User Management
router.get("/admin/fetch-all-customers", isAuthenticatedUser, authorizeRoles("admin"), getAllUsers);

// 3. Verification Hub: Pending Registrations
router.get("/admin/pending-approvals", isAuthenticatedUser, authorizeRoles("admin"), getPendingApprovals);

// 4. Verification Hub: Approve or Reject
router.put("/admin/approve-user/:id", isAuthenticatedUser, authorizeRoles("admin"), approveUser);

// 5. Remove User
router.delete("/admin/user/remove/:id", isAuthenticatedUser, authorizeRoles("admin"), removeUser);

router.get("/admin/delivery-boys/active", isAuthenticatedUser, authorizeRoles("admin"), getAvailableRiders);

// 7. Order Dispatch Management
router.get("/admin/orders/pending-dispatch", isAuthenticatedUser, authorizeRoles("admin"), getPendingDispatchOrders);

router.route('/admin/order-dispatch').put(isAuthenticatedUser, authorizeRoles('admin'), dispatchOrder);

// 8. Analytics & Reports
router.get("/admin/sales-trend", isAuthenticatedUser, authorizeRoles('admin'), getSalesTrend);

router.get("/admin/reports", isAuthenticatedUser, authorizeRoles('admin'), getPartnerReports);

// 9. Financial Management
router.get("/admin/withdrawals", isAuthenticatedUser, authorizeRoles('admin'), getWithdrawalRequests);
router.put("/admin/withdrawal/:id", isAuthenticatedUser, authorizeRoles('admin'), updateWithdrawalStatus);


module.exports = router;
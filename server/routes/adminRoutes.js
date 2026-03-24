const express = require("express");
const router = express.Router();
const { 
  getAllUsers, 
  removeUser, 
  updateUserStatus, 
  getAdminStats, 
  getPendingApprovals, 
  approveUser
} = require("../controller/admin/adminController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");


/**
 * DEBUGGING MIDDLEWARE
 * This will print to your VS Code terminal every time an admin route is hit.
 * It helps us see if the token is even reaching the server.
 */
router.use((req, res, next) => {
  console.log(`--- Admin Route Hit: ${req.method} ${req.url} ---`);
  next();
});

// 1. Dashboard Stats
// Apply middlewares individually to ensure they trigger correctly per request
router.get("/admin/stats", isAuthenticatedUser, authorizeRoles("admin"), getAdminStats);

// 2. User Directory (GET http://localhost:3000/admin/users)
router.get("/admin/fetch-all-customers", isAuthenticatedUser, authorizeRoles("admin"), getAllUsers);

// 3. Pending Approvals
router.get("/admin/pending-approvals", isAuthenticatedUser, authorizeRoles("admin"), getPendingApprovals);

router.get("/admin/approve-user/:id", isAuthenticatedUser, authorizeRoles("admin"), approveUser);

// 5. Remove User 
router.delete("/admin/user/remove/:id", isAuthenticatedUser, authorizeRoles("admin"), removeUser);



module.exports = router;
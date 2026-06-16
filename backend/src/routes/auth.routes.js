import express from "express";
import {
  register,
  login,
  logout,
  checkAuth,
  updateProfile,
  followUser,
  unfollowUser,
  getUserProfile,
  getAllUsers,
  searchUsers,
  changePassword,
  deleteAccount,
  getPendingUsers,
  updateSettings,
  getUserApprovalRecords,
  approveUser,
  rejectUser,
  getPendingUsersByCollege,
  approveUserByCollege,
  rejectUserByCollege,
  forgotPassword,
  resetPassword,
  verifyResetToken,
} from "../controllers/auth.controllers.js";
import {
  protectRoute,
  requireSystemAdmin,
  requireCollegeAdmin,
} from "../middlewares/auth.middlewares.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify-reset-token/:token", verifyResetToken);
router.get("/check", protectRoute, checkAuth);
router.post("/logout", logout);
router.put("/update-profile", protectRoute, updateProfile);
router.put("/settings", protectRoute, updateSettings);
router.put("/change-password", protectRoute, changePassword);
router.delete("/delete-account", protectRoute, deleteAccount);
router.post("/follow/:userId", protectRoute, followUser);
router.post("/unfollow/:userId", protectRoute, unfollowUser);
router.get("/search", searchUsers);
router.get("/profile/:userId", getUserProfile);
router.get("/users", getAllUsers);

// System Admin Routes
router.get(
  "/admin/pending-users",
  protectRoute,
  requireSystemAdmin,
  getPendingUsers,
);
router.get(
  "/admin/user-records",
  protectRoute,
  requireSystemAdmin,
  getUserApprovalRecords,
);
router.patch(
  "/admin/approve/:userId",
  protectRoute,
  requireSystemAdmin,
  approveUser,
);
router.patch(
  "/admin/reject/:userId",
  protectRoute,
  requireSystemAdmin,
  rejectUser,
);

// College Admin Routes
router.get(
  "/college-admin/pending-users",
  protectRoute,
  requireCollegeAdmin,
  getPendingUsersByCollege,
);
router.patch(
  "/college-admin/approve/:userId",
  protectRoute,
  requireCollegeAdmin,
  approveUserByCollege,
);
router.patch(
  "/college-admin/reject/:userId",
  protectRoute,
  requireCollegeAdmin,
  rejectUserByCollege,
);

export default router;

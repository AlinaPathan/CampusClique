import express from "express";
import {
  createCommunity,
  getAllCommunities,
  getJoinedCommunities,
  getCommunityById,
  joinCommunity,
  leaveCommunity,
  searchCommunities,
  deleteCommunity,
} from "../controllers/community.controllers.js";
import { protectRoute } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// Public routes
router.get("/", getAllCommunities);
router.get("/search", searchCommunities);

// Protected routes - user-specific routes must come before :communityId
router.get("/user/joined", protectRoute, getJoinedCommunities);
router.post("/", protectRoute, createCommunity);

// Routes with :communityId parameter
router.get("/:communityId", getCommunityById);
router.post("/:communityId/join", protectRoute, joinCommunity);
router.post("/:communityId/leave", protectRoute, leaveCommunity);
router.delete("/:communityId", protectRoute, deleteCommunity);

export default router;

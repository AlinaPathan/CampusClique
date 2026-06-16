import express from "express";
import {
  createPost,
  getAllPosts,
  getUserPosts,
  getPostsByUserId,
  getLikedPosts,
  getLikedPostsByUserId,
  getMediaPostsByUserId,
  getPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
  getTrendingHashtags,
  getPostsByHashtag,
  searchPosts,
  repostPost,
  getRecommendations,
} from "../controllers/post.controllers.js";
import { protectRoute } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// Get trending hashtags (must be before /:postId route)
router.get("/trending/hashtags", getTrendingHashtags);

// Get AI recommendations for users and posts
router.get("/recommendations", protectRoute, getRecommendations);

// Search posts
router.get("/search", searchPosts);

// Get posts by hashtag
router.get("/hashtag/:hashtag", getPostsByHashtag);

// Create post
router.post("/", protectRoute, createPost);

// Get all posts
router.get("/", getAllPosts);

// Get user's posts (logged in user)
router.get("/user/posts", protectRoute, getUserPosts);

// Get liked posts (logged in user)
router.get("/user/liked", protectRoute, getLikedPosts);

// Get liked posts by specific user ID
router.get("/user/:userId/liked", getLikedPostsByUserId);

// Get media posts by specific user ID
router.get("/user/:userId/media", getMediaPostsByUserId);

// Get posts by specific user ID (must be before /:postId)
router.get("/user/:userId", getPostsByUserId);

// Get single post
router.get("/:postId", getPost);

// Update post
router.put("/:postId", protectRoute, updatePost);

// Delete post
router.delete("/:postId", protectRoute, deletePost);

// Like/Unlike post
router.post("/:postId/like", protectRoute, likePost);

// Repost/Unrepost post
router.post("/:postId/repost", protectRoute, repostPost);

// Add comment
router.post("/:postId/comment", protectRoute, addComment);

// Delete comment
router.delete("/:postId/comment/:commentId", protectRoute, deleteComment);

export default router;

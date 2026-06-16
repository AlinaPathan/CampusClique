import express from "express";
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
} from "../controllers/bookmark.controllers.js";
import { protectRoute } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// Get all bookmarks
router.get("/", protectRoute, getBookmarks);

// Add bookmark
router.post("/:postId", protectRoute, addBookmark);

// Remove bookmark
router.delete("/:postId", protectRoute, removeBookmark);

export default router;

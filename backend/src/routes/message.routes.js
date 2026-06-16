import express from "express";
import {
  sendMessage,
  getMessages,
  getConversations,
  createConversation,
  markAsRead,
} from "../controllers/message.controllers.js";
import { protectRoute } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// Protected routes
router.post("/send", protectRoute, sendMessage);
router.get("/conversations", protectRoute, getConversations);
router.post("/conversations", protectRoute, createConversation);
router.get("/:conversationId", protectRoute, getMessages);
router.patch("/:messageId/read", protectRoute, markAsRead);

export default router;

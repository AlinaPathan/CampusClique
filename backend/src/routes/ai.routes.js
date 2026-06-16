import express from "express";
import {
  chatWithAi,
  clearChatHistory,
  getChatHistory,
  listAiModels,
} from "../controllers/ai.controllers.js";
import { protectRoute } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.post("/chat", protectRoute, chatWithAi);
router.get("/chat/history", protectRoute, getChatHistory);
router.delete("/chat/history", protectRoute, clearChatHistory);
router.get("/models", listAiModels);

export default router;

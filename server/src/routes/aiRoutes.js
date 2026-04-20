import express from "express";

import { chatbotReply, getAIInsights, getRecommendations } from "../controllers/aiController.js";
import { roles } from "../config/constants.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/recommendations", getRecommendations);
router.post("/chatbot", chatbotReply);
router.get("/insights", protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN, roles.STAFF), getAIInsights);

export default router;

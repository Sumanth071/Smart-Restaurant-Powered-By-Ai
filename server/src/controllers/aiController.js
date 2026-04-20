import { isDemoMode } from "../config/env.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { generateChatbotReply, getFoodRecommendations } from "../services/aiService.js";
import { buildAIInsights } from "../services/analyticsService.js";
import { demoStore } from "../services/demoStore.js";

export const getRecommendations = asyncHandler(async (req, res) => {
  const { restaurant, preference, budget, isVeg, spiceLevel } = req.body;

  if (isDemoMode) {
    res.json({
      title: "AI Food Recommendations",
      recommendations: demoStore.getRecommendations({
        restaurant,
        preference,
        budget,
        isVeg: typeof isVeg === "boolean" ? isVeg : undefined,
        spiceLevel,
      }),
    });
    return;
  }

  const recommendations = await getFoodRecommendations({
    restaurant,
    preference,
    budget,
    isVeg: typeof isVeg === "boolean" ? isVeg : undefined,
    spiceLevel,
  });

  res.json({
    title: "AI Food Recommendations",
    recommendations,
  });
});

export const chatbotReply = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (isDemoMode) {
    res.json({ reply: demoStore.chatbotReply(message) });
    return;
  }

  res.json({
    reply: generateChatbotReply(message),
  });
});

export const getAIInsights = asyncHandler(async (req, res) => {
  if (isDemoMode) {
    res.json(demoStore.getAIInsights(req));
    return;
  }

  const insights = await buildAIInsights(req);
  res.json(insights);
});

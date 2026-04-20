import { isDemoMode } from "../config/env.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { buildDashboardSummary } from "../services/analyticsService.js";
import { demoStore } from "../services/demoStore.js";

export const getDashboardSummary = asyncHandler(async (req, res) => {
  if (isDemoMode) {
    res.json(demoStore.getDashboardSummary(req));
    return;
  }

  const summary = await buildDashboardSummary(req);
  res.json(summary);
});

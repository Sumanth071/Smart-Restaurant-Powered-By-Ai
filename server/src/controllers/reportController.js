import { isDemoMode } from "../config/env.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { buildReportsOverview } from "../services/analyticsService.js";
import { demoStore } from "../services/demoStore.js";

export const getReportsOverview = asyncHandler(async (req, res) => {
  if (isDemoMode) {
    res.json(demoStore.getReportsOverview(req));
    return;
  }

  const report = await buildReportsOverview(req);
  res.json(report);
});

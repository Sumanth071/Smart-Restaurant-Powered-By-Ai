import express from "express";

import { getDashboardSummary } from "../controllers/dashboardController.js";
import { roles } from "../config/constants.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN, roles.STAFF), getDashboardSummary);

export default router;

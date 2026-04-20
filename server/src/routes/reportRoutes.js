import express from "express";

import { getReportsOverview } from "../controllers/reportController.js";
import { roles } from "../config/constants.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/overview", protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN, roles.STAFF), getReportsOverview);

export default router;

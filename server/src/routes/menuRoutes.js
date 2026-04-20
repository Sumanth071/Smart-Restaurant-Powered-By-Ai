import express from "express";

import { createMenuItem, deleteMenuItem, getMenuItem, listMenuItems, updateMenuItem } from "../controllers/menuController.js";
import { roles } from "../config/constants.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(listMenuItems)
  .post(protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN, roles.STAFF), createMenuItem);
router
  .route("/:id")
  .get(getMenuItem)
  .put(protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN, roles.STAFF), updateMenuItem)
  .delete(protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN, roles.STAFF), deleteMenuItem);

export default router;

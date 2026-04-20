import express from "express";

import { createOrder, deleteOrder, getOrder, listOrders, updateOrder } from "../controllers/orderController.js";
import { roles } from "../config/constants.js";
import { authorize, optionalProtect, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, listOrders).post(optionalProtect, createOrder);
router
  .route("/:id")
  .get(protect, getOrder)
  .put(protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN, roles.STAFF, roles.GUEST), updateOrder)
  .delete(protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN, roles.STAFF, roles.GUEST), deleteOrder);

export default router;

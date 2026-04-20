import express from "express";

import {
  createRestaurant,
  deleteRestaurant,
  getRestaurant,
  listRestaurants,
  updateRestaurant,
} from "../controllers/restaurantController.js";
import { roles } from "../config/constants.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(listRestaurants).post(protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN), createRestaurant);
router
  .route("/:id")
  .get(getRestaurant)
  .put(protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN), updateRestaurant)
  .delete(protect, authorize(roles.SUPER_ADMIN), deleteRestaurant);

export default router;

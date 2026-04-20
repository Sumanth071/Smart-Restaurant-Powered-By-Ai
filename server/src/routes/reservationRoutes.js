import express from "express";

import {
  createReservation,
  deleteReservation,
  getReservation,
  listReservations,
  updateReservation,
} from "../controllers/reservationController.js";
import { roles } from "../config/constants.js";
import { authorize, optionalProtect, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, listReservations).post(optionalProtect, createReservation);
router
  .route("/:id")
  .get(protect, getReservation)
  .put(protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN, roles.STAFF, roles.GUEST), updateReservation)
  .delete(protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN, roles.STAFF, roles.GUEST), deleteReservation);

export default router;

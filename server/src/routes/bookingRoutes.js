import express from "express";

import { createBooking, deleteBooking, getBooking, listBookings, updateBooking } from "../controllers/bookingController.js";
import { roles } from "../config/constants.js";
import { authorize, optionalProtect, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, listBookings).post(optionalProtect, createBooking);
router
  .route("/:id")
  .get(protect, getBooking)
  .put(protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN, roles.STAFF, roles.GUEST), updateBooking)
  .delete(protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN, roles.STAFF, roles.GUEST), deleteBooking);

export default router;

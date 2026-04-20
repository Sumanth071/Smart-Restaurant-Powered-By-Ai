import express from "express";

import { createUser, deleteUser, getUser, listUsers, updateUser } from "../controllers/userController.js";
import { roles } from "../config/constants.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN), listUsers)
  .post(protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN), createUser);
router
  .route("/:id")
  .get(protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN), getUser)
  .put(protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN), updateUser)
  .delete(protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN), deleteUser);

export default router;

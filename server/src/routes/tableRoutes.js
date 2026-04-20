import express from "express";

import { createTable, deleteTable, getTable, listTables, updateTable } from "../controllers/tableController.js";
import { roles } from "../config/constants.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(listTables).post(protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN, roles.STAFF), createTable);
router
  .route("/:id")
  .get(getTable)
  .put(protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN, roles.STAFF), updateTable)
  .delete(protect, authorize(roles.SUPER_ADMIN, roles.RESTAURANT_ADMIN, roles.STAFF), deleteTable);

export default router;

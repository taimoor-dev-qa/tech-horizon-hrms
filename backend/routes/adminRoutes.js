import express from "express";

import { getAdminAccess } from "../controllers/adminController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import ROLES from "../constants/roles.js";

const router = express.Router();

router.get(
  "/access",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN
  ),
  getAdminAccess
);

export default router;
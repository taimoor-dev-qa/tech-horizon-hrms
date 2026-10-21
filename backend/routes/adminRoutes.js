import express from "express";

import { getAdminAccess } from "../controllers/adminController.js";
import { createPrivilegedUser } from "../controllers/adminUserController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import ROLES from "../constants/roles.js";
import { privilegedUserSchema } from "../validators/adminUserValidators.js";

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

router.post(
  "/users",
  protect,
  authorizeRoles(ROLES.SUPER_ADMIN),
  validateRequest(privilegedUserSchema),
  createPrivilegedUser
);

export default router;

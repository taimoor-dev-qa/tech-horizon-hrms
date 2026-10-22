import express from "express";

import { getAdminAccess } from "../controllers/adminController.js";
import {
  changePrivilegedUserRole,
  createPrivilegedUser,
  deactivatePrivilegedUser,
  reactivatePrivilegedUser,
  resetPrivilegedUserPassword,
} from "../controllers/adminUserController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import ROLES from "../constants/roles.js";
import {
  privilegedPasswordResetSchema,
  privilegedRoleSchema,
  privilegedUserSchema,
} from "../validators/adminUserValidators.js";
import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

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

const superAdminUserAccess = [
  protect,
  authorizeRoles(ROLES.SUPER_ADMIN),
  validateObjectId("id"),
];

router.patch(
  "/users/:id/deactivate",
  ...superAdminUserAccess,
  deactivatePrivilegedUser
);

router.patch(
  "/users/:id/reactivate",
  ...superAdminUserAccess,
  reactivatePrivilegedUser
);

router.patch(
  "/users/:id/password",
  ...superAdminUserAccess,
  validateRequest(privilegedPasswordResetSchema),
  resetPrivilegedUserPassword
);

router.patch(
  "/users/:id/role",
  ...superAdminUserAccess,
  validateRequest(privilegedRoleSchema),
  changePrivilegedUserRole
);

export default router;

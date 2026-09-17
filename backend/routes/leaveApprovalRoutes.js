import express from "express";

import {
  leaveDecisionSchema,
} from "../validators/leaveValidators.js";

import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

import validateRequest
  from "../middleware/validateRequest.js";

import {
  getHrLeaves,
  getManagerLeaves,
  reviewByHr,
  reviewByManager,
} from "../controllers/leaveApprovalController.js";

import protect
  from "../middleware/authMiddleware.js";

import authorizeRoles
  from "../middleware/roleMiddleware.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

router.patch(
  "/:id/manager",
  protect,
  authorizeRoles(
    ROLES.MANAGER,
    ROLES.SUPER_ADMIN
  ),
  validateObjectId("id"),
  validateRequest(
    leaveDecisionSchema
  ),
  reviewByManager
);

router.patch(
  "/:id/hr",
  protect,
  authorizeRoles(
    ROLES.HR_ADMIN,
    ROLES.SUPER_ADMIN
  ),
  validateObjectId("id"),
  validateRequest(
    leaveDecisionSchema
  ),
  reviewByHr
);

router.get(
  "/manager",
  protect,
  authorizeRoles(
    ROLES.MANAGER,
    ROLES.SUPER_ADMIN
  ),
  getManagerLeaves
);

router.get(
  "/hr",
  protect,
  authorizeRoles(
    ROLES.HR_ADMIN,
    ROLES.SUPER_ADMIN
  ),
  getHrLeaves
);

export default router;
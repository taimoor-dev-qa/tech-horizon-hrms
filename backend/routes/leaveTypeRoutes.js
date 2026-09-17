import express from "express";

import {
  createLeaveType,
  getLeaveTypes,
  updateLeaveType,
} from "../controllers/leaveTypeController.js";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import validateRequest from "../middleware/validateRequest.js";

import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

import {
  createLeaveTypeSchema,
  updateLeaveTypeSchema,
} from "../validators/leaveValidators.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

const hrAccess = authorizeRoles(
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN
);

router.get(
  "/",
  protect,
  getLeaveTypes
);

router.post(
  "/",
  protect,
  hrAccess,
  validateRequest(
    createLeaveTypeSchema
  ),
  createLeaveType
);

router.put(
  "/:id",
  protect,
  hrAccess,
  validateObjectId("id"),
  validateRequest(
    updateLeaveTypeSchema
  ),
  updateLeaveType
);

export default router;

import express from "express";

import {
  changeAttendanceStatus,
  createManualAttendance,
  getAttendance,
  getDailySummary,
} from "../controllers/attendanceAdminController.js";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import validateRequest from "../middleware/validateRequest.js";

import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

import {
  manualAttendanceSchema,
  attendanceStatusSchema,
} from "../validators/attendanceValidators.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

const attendanceAccess = authorizeRoles(
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN,
  ROLES.MANAGER
);

const hrAccess = authorizeRoles(
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN
);

router.get(
  "/",
  protect,
  attendanceAccess,
  getAttendance
);

router.get(
  "/summary",
  protect,
  attendanceAccess,
  getDailySummary
);

router.post(
  "/manual",
  protect,
  hrAccess,
  validateRequest(
    manualAttendanceSchema
  ),
  createManualAttendance
);

router.patch(
  "/:id/status",
  protect,
  hrAccess,
  validateObjectId("id"),
  validateRequest(
    attendanceStatusSchema
  ),
  changeAttendanceStatus
);

export default router;
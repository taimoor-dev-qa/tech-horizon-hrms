import express from "express";

import {
  changeAttendanceStatus,
  createManualAttendance,
  getAttendance,
  getDailySummary,
} from "../controllers/attendanceAdminController.js";

import protect from "../middleware/authMiddleware.js";

import authorizeRoles
  from "../middleware/roleMiddleware.js";

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
  createManualAttendance
);

router.patch(
  "/:id/status",
  protect,
  hrAccess,
  changeAttendanceStatus
);

export default router;
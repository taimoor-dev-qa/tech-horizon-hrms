import express from "express";

import validateRequest
  from "../middleware/validateRequest.js";

import {
  manualAttendanceSchema,
  attendanceStatusSchema,
} from "../validators/attendanceValidators.js";

import {
  checkIn,
  checkOut,
  getMyAttendance,
} from "../controllers/attendanceController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/manual",
  protect,
  hrAccess,
  validateRequest(
    manualAttendanceSchema
  ),
  markManualAttendance
);

router.patch(
  "/:id/status",
  protect,
  hrAccess,
  validateObjectId("id"),
  validateRequest(
    attendanceStatusSchema
  ),
  updateAttendanceStatus
);

router.post(
  "/check-in",
  protect,
  checkIn
);

router.patch(
  "/check-out",
  protect,
  checkOut
);

router.get(
  "/me",
  protect,
  getMyAttendance
);

export default router;
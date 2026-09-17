import express from "express";

import {
  checkIn,
  checkOut,
  getMyAttendance,
} from "../controllers/attendanceController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

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
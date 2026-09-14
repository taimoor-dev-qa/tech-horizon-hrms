import express from "express";

import {
  createTimesheet,
  deleteTimesheet,
  getMyTimesheets,
  updateTimesheet,
} from "../controllers/timesheetController.js";

import protect
  from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/my",
  protect,
  getMyTimesheets
);

router.post(
  "/",
  protect,
  createTimesheet
);

router.put(
  "/:id",
  protect,
  updateTimesheet
);

router.delete(
  "/:id",
  protect,
  deleteTimesheet
);

export default router;
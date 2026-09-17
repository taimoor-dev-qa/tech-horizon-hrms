import express from "express";

import {
  createTimesheet,
  deleteTimesheet,
  getMyTimesheets,
  updateTimesheet,
} from "../controllers/timesheetController.js";

import protect from "../middleware/authMiddleware.js";

import validateRequest
  from "../middleware/validateRequest.js";

import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

import {
  createTimesheetSchema,
  updateTimesheetSchema,
} from "../validators/timesheetValidators.js";

const router = express.Router();

router.get(
  "/my",
  protect,
  getMyTimesheets
);

router.post(
  "/",
  protect,
  validateRequest(
    createTimesheetSchema
  ),
  createTimesheet
);

router.put(
  "/:id",
  protect,
  validateObjectId("id"),
  validateRequest(
    updateTimesheetSchema
  ),
  updateTimesheet
);

router.delete(
  "/:id",
  protect,
  validateObjectId("id"),
  deleteTimesheet
);

export default router;
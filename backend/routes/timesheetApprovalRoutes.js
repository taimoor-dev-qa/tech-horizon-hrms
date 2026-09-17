import express from "express";

import {
  getPendingTimesheets,
  reviewEmployeeTimesheet,
} from "../controllers/timesheetApprovalController.js";

import protect
  from "../middleware/authMiddleware.js";

import authorizeRoles
  from "../middleware/roleMiddleware.js";

import validateRequest
  from "../middleware/validateRequest.js";

import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

import {
  timesheetDecisionSchema,
} from "../validators/timesheetValidators.js";

import ROLES
  from "../constants/roles.js";

const router = express.Router();

const managerAccess = authorizeRoles(
  ROLES.MANAGER,
  ROLES.TEAM_LEAD,
  ROLES.SUPER_ADMIN
);

router.get(
  "/pending",
  protect,
  managerAccess,
  getPendingTimesheets
);

router.patch(
  "/:id/review",
  protect,
  managerAccess,
  validateObjectId("id"),
  validateRequest(
    timesheetDecisionSchema
  ),
  reviewEmployeeTimesheet
);

export default router;
import express from "express";

import {
  createInterview,
  getInterviewById,
  getInterviews,
  getMyInterviews,
  updateInterview,
} from "../controllers/interviewController.js";

import {
  cancelInterview,
  completeInterview,
} from "../controllers/interviewActionController.js";

import ROLES from "../constants/roles.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

import {
  interviewResultSchema,
  interviewSchema,
} from "../validators/recruitmentValidators.js";

const router = express.Router();

const recruitmentAccess = authorizeRoles(
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN
);

const interviewerAccess = authorizeRoles(
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN,
  ROLES.MANAGER,
  ROLES.TEAM_LEAD
);

const updateInterviewSchema =
  interviewSchema
    .omit({
      candidate: true,
    })
    .partial();

router.post(
  "/",
  protect,
  recruitmentAccess,
  validateRequest(interviewSchema),
  createInterview
);

router.get(
  "/my",
  protect,
  interviewerAccess,
  getMyInterviews
);

router.get(
  "/",
  protect,
  recruitmentAccess,
  getInterviews
);

router.get(
  "/:id",
  protect,
  interviewerAccess,
  validateObjectId("id"),
  getInterviewById
);

router.put(
  "/:id",
  protect,
  recruitmentAccess,
  validateObjectId("id"),
  validateRequest(updateInterviewSchema),
  updateInterview
);

router.patch(
  "/:id/cancel",
  protect,
  recruitmentAccess,
  validateObjectId("id"),
  cancelInterview
);

router.patch(
  "/:id/complete",
  protect,
  interviewerAccess,
  validateObjectId("id"),
  validateRequest(interviewResultSchema),
  completeInterview
);

export default router;

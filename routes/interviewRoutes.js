import express from "express";

import validateRequest
  from "../middleware/validateRequest.js";

import {
  interviewResultSchema,
  interviewSchema,
} from "../validators/recruitmentValidators.js";

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

import protect
  from "../middleware/authMiddleware.js";

import authorizeRoles
  from "../middleware/roleMiddleware.js";

import ROLES from "../constants/roles.js";

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

router.post(
  "/",
  protect,
  recruitmentAccess,
  validateRequest(
    interviewSchema
  ),
  createInterview
);

router.patch(
  "/:id/complete",
  protect,
  interviewerAccess,
  validateObjectId("id"),
  validateRequest(
    interviewResultSchema
  ),
  completeInterview
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

router.post(
  "/",
  protect,
  recruitmentAccess,
  createInterview
);

router.get(
  "/:id",
  protect,
  interviewerAccess,
  getInterviewById
);

router.put(
  "/:id",
  protect,
  recruitmentAccess,
  updateInterview
);

router.patch(
  "/:id/cancel",
  protect,
  recruitmentAccess,
  cancelInterview
);

router.put(
  "/:id",
  protect,
  recruitmentAccess,
  validateObjectId("id"),
  validateRequest(
    updateInterviewSchema
  ),
  updateInterview
);

router.patch(
  "/:id/complete",
  protect,
  interviewerAccess,
  completeInterview
);

export default router;

export const updateInterviewSchema =
  interviewSchema
    .omit({
      candidate: true,
    })
    .partial();


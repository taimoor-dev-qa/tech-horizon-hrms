import express from "express";

import {
  createPerformanceReview,
  getMyPerformanceReviews,
  getPerformanceReviewById,
  getPerformanceReviews,
  updatePerformanceReview,
} from "../controllers/performanceController.js";

import {
  acknowledgePerformanceReview,
  submitPerformanceReview,
} from "../controllers/performanceActionController.js";

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
  performanceAcknowledgeSchema,
  performanceReviewSchema,
  updatePerformanceSchema,
} from "../validators/performanceValidators.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

const reviewerAccess = authorizeRoles(
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN,
  ROLES.MANAGER,
  ROLES.TEAM_LEAD
);

router.get(
  "/my",
  protect,
  getMyPerformanceReviews
);

router.get(
  "/",
  protect,
  reviewerAccess,
  getPerformanceReviews
);

router.post(
  "/",
  protect,
  reviewerAccess,
  validateRequest(
    performanceReviewSchema
  ),
  createPerformanceReview
);

router.get(
  "/:id",
  protect,
  reviewerAccess,
  validateObjectId("id"),
  getPerformanceReviewById
);

router.put(
  "/:id",
  protect,
  reviewerAccess,
  validateObjectId("id"),
  validateRequest(
    updatePerformanceSchema
  ),
  updatePerformanceReview
);

router.patch(
  "/:id/submit",
  protect,
  reviewerAccess,
  validateObjectId("id"),
  submitPerformanceReview
);

router.patch(
  "/:id/acknowledge",
  protect,
  validateObjectId("id"),
  validateRequest(
    performanceAcknowledgeSchema
  ),
  acknowledgePerformanceReview
);

export default router;
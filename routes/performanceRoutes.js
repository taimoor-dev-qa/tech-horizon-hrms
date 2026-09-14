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
  createPerformanceReview
);

router.get(
  "/:id",
  protect,
  reviewerAccess,
  getPerformanceReviewById
);

router.put(
  "/:id",
  protect,
  reviewerAccess,
  updatePerformanceReview
);

router.patch(
  "/:id/submit",
  protect,
  reviewerAccess,
  submitPerformanceReview
);

router.patch(
  "/:id/acknowledge",
  protect,
  acknowledgePerformanceReview
);

export default router;
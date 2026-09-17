import express from "express";

import {
  changeCandidateStatus,
  createCandidate,
  getCandidateById,
  getCandidates,
  updateCandidate,
} from "../controllers/candidateController.js";

import ROLES from "../constants/roles.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

import {
  candidateSchema,
  candidateStatusSchema,
  updateCandidateSchema,
} from "../validators/recruitmentValidators.js";

const router = express.Router();

const recruitmentAccess = authorizeRoles(
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN
);

router.post(
  "/",
  protect,
  recruitmentAccess,
  validateRequest(candidateSchema),
  createCandidate
);

router.get(
  "/",
  protect,
  recruitmentAccess,
  getCandidates
);

router.get(
  "/:id",
  protect,
  recruitmentAccess,
  validateObjectId("id"),
  getCandidateById
);

router.put(
  "/:id",
  protect,
  recruitmentAccess,
  validateObjectId("id"),
  validateRequest(updateCandidateSchema),
  updateCandidate
);

router.patch(
  "/:id/status",
  protect,
  recruitmentAccess,
  validateObjectId("id"),
  validateRequest(candidateStatusSchema),
  changeCandidateStatus
);

export default router;

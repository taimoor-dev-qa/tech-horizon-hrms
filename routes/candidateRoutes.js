import express from "express";

import {
  candidateSchema,
  candidateStatusSchema,
  updateCandidateSchema,
} from "../validators/recruitmentValidators.js";

import {
  changeCandidateStatus,
  createCandidate,
  getCandidateById,
  getCandidates,
  updateCandidate,
} from "../controllers/candidateController.js";

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

router.post(
  "/",
  protect,
  recruitmentAccess,
  validateRequest(
    candidateSchema
  ),
  createCandidate
);

router.patch(
  "/:id/status",
  protect,
  recruitmentAccess,
  validateObjectId("id"),
  validateRequest(
    candidateStatusSchema
  ),
  changeCandidateStatus
);

router.get(
  "/",
  protect,
  recruitmentAccess,
  getCandidates
);

router.post(
  "/",
  protect,
  recruitmentAccess,
  createCandidate
);

router.get(
  "/:id",
  protect,
  recruitmentAccess,
  getCandidateById
);

router.put(
  "/:id",
  protect,
  recruitmentAccess,
  validateObjectId("id"),
  validateRequest(  
    updateCandidateSchema
  ),
  updateCandidate
);

router.patch(
  "/:id/status",
  protect,
  recruitmentAccess,
  changeCandidateStatus
);

export default router;
import express from "express";

import validateRequest
  from "../middleware/validateRequest.js";

import {
  candidateHireSchema,
} from "../validators/recruitmentValidators.js";

import {
  hireCandidate,
} from "../controllers/candidateHireController.js";

import protect
  from "../middleware/authMiddleware.js";

import authorizeRoles
  from "../middleware/roleMiddleware.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

router.post(
  "/:id/hire",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN
  ),
  validateObjectId("id"),
  validateRequest(
    candidateHireSchema
  ),
  hireCandidate
);



router.post(
  "/:id/hire",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN
  ),
  hireCandidate
);

export default router;
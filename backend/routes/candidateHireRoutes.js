import express from "express";

import {
  hireCandidate,
} from "../controllers/candidateHireController.js";

import ROLES from "../constants/roles.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

import {
  candidateHireSchema,
} from "../validators/recruitmentValidators.js";

const router = express.Router();

router.post(
  "/:id/hire",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN
  ),
  validateObjectId("id"),
  validateRequest(candidateHireSchema),
  hireCandidate
);

export default router;

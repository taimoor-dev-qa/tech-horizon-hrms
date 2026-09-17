import express from "express";

import {
  createTeam,
  deleteTeam,
  getTeamById,
  getTeams,
  updateTeam,
} from "../controllers/teamController.js";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import validateRequest from "../middleware/validateRequest.js";

import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

import {
  createTeamSchema,
  updateTeamSchema,
} from "../validators/teamValidators.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

// Get all teams
router.get(
  "/",
  protect,
  getTeams
);

// Get team by ID
router.get(
  "/:id",
  protect,
  validateObjectId("id"),
  getTeamById
);

// Create team
router.post(
  "/",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN
  ),
  validateRequest(
    createTeamSchema
  ),
  createTeam
);

// Update team
router.put(
  "/:id",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN
  ),
  validateObjectId("id"),
  validateRequest(
    updateTeamSchema
  ),
  updateTeam
);

// Delete team
router.delete(
  "/:id",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN
  ),
  validateObjectId("id"),
  deleteTeam
);

export default router;
import express from "express";

import {
  createTeam,
  deleteTeam,
  getTeamById,
  getTeams,
  updateTeam,
} from "../controllers/teamController.js";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles
  from "../middleware/roleMiddleware.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

router.get(
  "/",
  protect,
  getTeams
);

router.get(
  "/:id",
  protect,
  getTeamById
);

router.post(
  "/",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN
  ),
  createTeam
);

router.put(
  "/:id",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN
  ),
  updateTeam
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(ROLES.SUPER_ADMIN),
  deleteTeam
);

export default router;
import express from "express";

import {
  assignAsset,
  getAssignments,
  returnAsset,
} from "../controllers/assetAssignmentController.js";

import protect
  from "../middleware/authMiddleware.js";

import authorizeRoles
  from "../middleware/roleMiddleware.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

const hrAccess = authorizeRoles(
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN
);

router.get(
  "/",
  protect,
  hrAccess,
  getAssignments
);

router.post(
  "/",
  protect,
  hrAccess,
  assignAsset
);

router.patch(
  "/:id/return",
  protect,
  hrAccess,
  returnAsset
);

export default router;
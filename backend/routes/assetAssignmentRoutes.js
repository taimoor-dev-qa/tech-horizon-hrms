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

import validateRequest
  from "../middleware/validateRequest.js";

import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

import {
  assignAssetSchema,
  returnAssetSchema,
} from "../validators/assetValidators.js";

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
  validateRequest(
    assignAssetSchema
  ),
  assignAsset
);

router.patch(
  "/:id/return",
  protect,
  hrAccess,
  validateObjectId("id"),
  validateRequest(
    returnAssetSchema
  ),
  returnAsset
);

export default router;
import express from "express";

import {
  createAsset,
  deleteAsset,
  getAssetById,
  getAssets,
  getMyAssets,
  updateAsset,
} from "../controllers/assetController.js";

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
  assetSchema,
  updateAssetSchema,
} from "../validators/assetValidators.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

const hrAccess = authorizeRoles(
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN
);

router.get(
  "/my",
  protect,
  getMyAssets
);

router.get(
  "/",
  protect,
  hrAccess,
  getAssets
);

router.post(
  "/",
  protect,
  hrAccess,
  validateRequest(assetSchema),
  createAsset
);

router.get(
  "/:id",
  protect,
  hrAccess,
  validateObjectId("id"),
  getAssetById
);

router.put(
  "/:id",
  protect,
  hrAccess,
  validateObjectId("id"),
  validateRequest(
    updateAssetSchema
  ),
  updateAsset
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN
  ),
  validateObjectId("id"),
  deleteAsset
);

export default router;
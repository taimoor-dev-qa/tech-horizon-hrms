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
  createAsset
);

router.get(
  "/:id",
  protect,
  hrAccess,
  getAssetById
);

router.put(
  "/:id",
  protect,
  hrAccess,
  updateAsset
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(ROLES.SUPER_ADMIN),
  deleteAsset
);

export default router;
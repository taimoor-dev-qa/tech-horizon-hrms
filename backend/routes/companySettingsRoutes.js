import express from "express";

import {
  getCompanySettings,
  updateCompanySettings,
} from "../controllers/companySettingsController.js";

import protect
  from "../middleware/authMiddleware.js";

import authorizeRoles
  from "../middleware/roleMiddleware.js";

import validateRequest
  from "../middleware/validateRequest.js";

import {
  companySettingsSchema,
} from "../validators/settingsValidators.js";

import ROLES
  from "../constants/roles.js";

const router = express.Router();

router.get(
  "/",
  protect,
  getCompanySettings
);

router.put(
  "/",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN
  ),
  validateRequest(
    companySettingsSchema
  ),
  updateCompanySettings
);

export default router;
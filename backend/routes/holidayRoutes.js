import express from "express";

import {
  createHoliday,
  deleteHoliday,
  getHolidays,
  updateHoliday,
} from "../controllers/holidayController.js";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import validateRequest from "../middleware/validateRequest.js";

import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

import {
  createHolidaySchema,
  updateHolidaySchema,
} from "../validators/holidayValidators.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

const hrAccess = authorizeRoles(
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN
);

router.get(
  "/",
  protect,
  getHolidays
);

router.post(
  "/",
  protect,
  hrAccess,
  validateRequest(
    createHolidaySchema
  ),
  createHoliday
);

router.put(
  "/:id",
  protect,
  hrAccess,
  validateObjectId("id"),
  validateRequest(
    updateHolidaySchema
  ),
  updateHoliday
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN
  ),
  validateObjectId("id"),
  deleteHoliday
);

export default router;


import express from "express";

import {
  createHoliday,
  deleteHoliday,
  getHolidays,
  updateHoliday,
} from "../controllers/holidayController.js";

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
  getHolidays
);

router.post(
  "/",
  protect,
  hrAccess,
  createHoliday
);

router.put(
  "/:id",
  protect,
  hrAccess,
  updateHoliday
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(ROLES.SUPER_ADMIN),
  deleteHoliday
);

export default router;
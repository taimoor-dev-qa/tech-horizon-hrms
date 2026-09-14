import express from "express";

import {
  createShift,
  deleteShift,
  getShiftById,
  getShifts,
  updateShift,
} from "../controllers/shiftController.js";

import protect from "../middleware/authMiddleware.js";

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
  getShifts
);

router.get(
  "/:id",
  protect,
  getShiftById
);

router.post(
  "/",
  protect,
  hrAccess,
  createShift
);

router.put(
  "/:id",
  protect,
  hrAccess,
  updateShift
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(ROLES.SUPER_ADMIN),
  deleteShift
);

export default router;
import express from "express";

import {
  createShift,
  deleteShift,
  getShiftById,
  getShifts,
  updateShift,
} from "../controllers/shiftController.js";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import validateRequest from "../middleware/validateRequest.js";

import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

import {
  createShiftSchema,
  updateShiftSchema,
} from "../validators/shiftValidators.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

const hrAccess = authorizeRoles(
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN
);

// Get all shifts
router.get(
  "/",
  protect,
  getShifts
);

// Get shift by ID
router.get(
  "/:id",
  protect,
  validateObjectId("id"),
  getShiftById
);

// Create shift
router.post(
  "/",
  protect,
  hrAccess,
  validateRequest(createShiftSchema),
  createShift
);

// Update shift
router.put(
  "/:id",
  protect,
  hrAccess,
  validateObjectId("id"),
  validateRequest(updateShiftSchema),
  updateShift
);

// Delete shift
router.delete(
  "/:id",
  protect,
  authorizeRoles(ROLES.SUPER_ADMIN),
  validateObjectId("id"),
  deleteShift
);

export default router;
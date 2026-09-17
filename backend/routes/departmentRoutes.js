import express from "express";

import validateRequest from "../middleware/validateRequest.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "../validators/departmentValidators.js";

import {
  createDepartment,
  deleteDepartment,
  getDepartmentById,
  getDepartments,
  updateDepartment,
} from "../controllers/departmentController.js";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import ROLES from "../constants/roles.js";

const router = express.Router();

const hrAccess = authorizeRoles(
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN
);

// Get all departments
router.get(
  "/",
  protect,
  getDepartments
);

// Get department by ID
router.get(
  "/:id",
  protect,
  validateObjectId("id"),
  getDepartmentById
);

// Create department
router.post(
  "/",
  protect,
  hrAccess,
  validateRequest(createDepartmentSchema),
  createDepartment
);

// Update department
router.put(
  "/:id",
  protect,
  hrAccess,
  validateObjectId("id"),
  validateRequest(updateDepartmentSchema),
  updateDepartment
);

// Delete department
router.delete(
  "/:id",
  protect,
  authorizeRoles(ROLES.SUPER_ADMIN),
  validateObjectId("id"),
  deleteDepartment
);

export default router;
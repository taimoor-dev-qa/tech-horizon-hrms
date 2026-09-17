import express from "express";

import {
  createProject,
  deleteProject,
  getMyProjects,
  getProjectById,
  getProjects,
  updateProject,
} from "../controllers/projectController.js";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import validateRequest from "../middleware/validateRequest.js";

import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

import {
  createProjectSchema,
  updateProjectSchema,
} from "../validators/projectValidators.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

const projectManagementAccess = authorizeRoles(
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN,
  ROLES.MANAGER
);

// Get my projects
router.get(
  "/my",
  protect,
  getMyProjects
);

// Get all projects
router.get(
  "/",
  protect,
  getProjects
);

// Create project
router.post(
  "/",
  protect,
  projectManagementAccess,
  validateRequest(
    createProjectSchema
  ),
  createProject
);

// Get project by ID
router.get(
  "/:id",
  protect,
  validateObjectId("id"),
  getProjectById
);

// Update project
router.put(
  "/:id",
  protect,
  projectManagementAccess,
  validateObjectId("id"),
  validateRequest(
    updateProjectSchema
  ),
  updateProject
);

// Delete project
router.delete(
  "/:id",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN
  ),
  validateObjectId("id"),
  deleteProject
);

export default router;

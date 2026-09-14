import express from "express";

import {
  createProject,
  deleteProject,
  getMyProjects,
  getProjectById,
  getProjects,
  updateProject,
} from "../controllers/projectController.js";

import protect
  from "../middleware/authMiddleware.js";

import authorizeRoles
  from "../middleware/roleMiddleware.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

const projectManagementAccess =
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN,
    ROLES.MANAGER
  );

router.get(
  "/my",
  protect,
  getMyProjects
);

router.get(
  "/",
  protect,
  getProjects
);

router.post(
  "/",
  protect,
  projectManagementAccess,
  createProject
);

router.get(
  "/:id",
  protect,
  getProjectById
);

router.put(
  "/:id",
  protect,
  projectManagementAccess,
  updateProject
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(ROLES.SUPER_ADMIN),
  deleteProject
);

export default router;
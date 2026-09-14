import express from "express";

import validateRequest
  from "../middleware/validateRequest.js";

import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

import {
  createEmployeeSchema,
  employeeStatusSchema,
  updateEmployeeSchema,
} from "../validators/employeeValidators.js";

import {
  createEmployee,
  getEmployeeById,
  getEmployees,
} from "../controllers/employeeController.js";

import {
  changeEmployeeStatus,
  deactivateEmployee,
  reactivateEmployee,
  updateEmployee,
} from "../controllers/employeeManagementController.js";

import {
  getMyProfile,
} from "../controllers/employeeProfileController.js";

import protect from "../middleware/authMiddleware.js";

import authorizeRoles
  from "../middleware/roleMiddleware.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

const hrAccess = authorizeRoles(
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN
);

const managementAccess = authorizeRoles(
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN,
  ROLES.MANAGER,
  ROLES.TEAM_LEAD
);

router.post(
  "/",
  protect,
  hrAccess,
  validateRequest(
    createEmployeeSchema
  ),
  createEmployee
);

router.get(
  "/:id",
  protect,
  managementAccess,
  validateObjectId("id"),
  getEmployeeById
);

router.put(
  "/:id",
  protect,
  hrAccess,
  validateObjectId("id"),
  validateRequest(
    updateEmployeeSchema
  ),
  updateEmployee
);

router.patch(
  "/:id/status",
  protect,
  hrAccess,
  validateObjectId("id"),
  validateRequest(
    employeeStatusSchema
  ),
  changeEmployeeStatus
);

router.get(
  "/me/profile",
  protect,
  getMyProfile
);

router.get(
  "/",
  protect,
  managementAccess,
  getEmployees
);

router.post(
  "/",
  protect,
  hrAccess,
  createEmployee
);

router.get(
  "/:id",
  protect,
  managementAccess,
  getEmployeeById
);

router.put(
  "/:id",
  protect,
  hrAccess,
  updateEmployee
);

router.patch(
  "/:id/deactivate",
  protect,
  hrAccess,
  deactivateEmployee
);

router.patch(
  "/:id/reactivate",
  protect,
  hrAccess,
  reactivateEmployee
);

router.patch(
  "/:id/status",
  protect,
  hrAccess,
  changeEmployeeStatus
);

export default router;
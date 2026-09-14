import express from "express";

import validateRequest
  from "../middleware/validateRequest.js";

import {
  salaryStructureSchema,
} from "../validators/payrollValidators.js";

import {
  createSalaryStructure,
  deactivateSalary,
  getSalaryByEmployee,
  getSalaryStructures,
} from "../controllers/salaryStructureController.js";

import protect
  from "../middleware/authMiddleware.js";

import authorizeRoles
  from "../middleware/roleMiddleware.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

const salaryAccess = authorizeRoles(
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN,
  ROLES.FINANCE
);

router.post(
  "/",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN
  ),
  validateRequest(
    salaryStructureSchema
  ),
  createSalaryStructure
);

router.get(
  "/",
  protect,
  salaryAccess,
  getSalaryStructures
);

router.post(
  "/",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN
  ),
  createSalaryStructure
);

router.get(
  "/employee/:employeeId",
  protect,
  salaryAccess,
  getSalaryByEmployee
);

router.patch(
  "/:id/deactivate",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN
  ),
  deactivateSalary
);

export default router;
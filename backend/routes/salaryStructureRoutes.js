import express from "express";

import {
  createSalaryStructure,
  deactivateSalary,
  getSalaryByEmployee,
  getSalaryStructures,
} from "../controllers/salaryStructureController.js";

import ROLES from "../constants/roles.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

import {
  salaryDeactivateSchema,
  salaryStructureSchema,
} from "../validators/payrollValidators.js";

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
  validateRequest(salaryStructureSchema),
  createSalaryStructure
);

router.get(
  "/",
  protect,
  salaryAccess,
  getSalaryStructures
);

router.get(
  "/employee/:employeeId",
  protect,
  salaryAccess,
  validateObjectId("employeeId"),
  getSalaryByEmployee
);

router.patch(
  "/:id/deactivate",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN
  ),
  validateObjectId("id"),
  validateRequest(
    salaryDeactivateSchema
  ),
  deactivateSalary
);

export default router;

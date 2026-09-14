import express from "express";

import {
  assetReport,
  attendanceReport,
  employeeReport,
  leaveReport,
  payrollReport,
  performanceReport,
  recruitmentReport,
} from "../controllers/reportController.js";

import protect
  from "../middleware/authMiddleware.js";

import authorizeRoles
  from "../middleware/roleMiddleware.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

const hrManagementAccess =
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN,
    ROLES.MANAGER
  );

const hrOnlyAccess =
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN
  );

const payrollAccess =
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN,
    ROLES.FINANCE
  );

router.get(
  "/employees",
  protect,
  hrManagementAccess,
  employeeReport
);

router.get(
  "/attendance",
  protect,
  hrManagementAccess,
  attendanceReport
);

router.get(
  "/leaves",
  protect,
  hrManagementAccess,
  leaveReport
);

router.get(
  "/payroll",
  protect,
  payrollAccess,
  payrollReport
);

router.get(
  "/recruitment",
  protect,
  hrOnlyAccess,
  recruitmentReport
);

router.get(
  "/performance",
  protect,
  hrManagementAccess,
  performanceReport
);

router.get(
  "/assets",
  protect,
  hrOnlyAccess,
  assetReport
);

export default router;
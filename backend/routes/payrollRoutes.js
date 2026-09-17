import express from "express";

import {
  createPayroll,
  getMyPayrolls,
  getPayrollById,
  getPayrolls,
} from "../controllers/payrollController.js";

import {
  generatePayroll,
  markPayrollPaid,
} from "../controllers/payrollActionController.js";

import {
  createBulkPayroll,
} from "../controllers/payrollBulkController.js";

import {
  payrollSummary,
} from "../controllers/payrollSummaryController.js";

import {
  getEmployeePayslip,
} from "../controllers/payslipController.js";

import ROLES from "../constants/roles.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

import {
  bulkPayrollSchema,
  payrollCreateSchema,
  payrollPaidSchema,
} from "../validators/payrollValidators.js";

const router = express.Router();

const payrollAccess = authorizeRoles(
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN,
  ROLES.FINANCE
);

router.get(
  "/my",
  protect,
  getMyPayrolls
);

router.get(
  "/my/:id",
  protect,
  validateObjectId("id"),
  getEmployeePayslip
);

router.get(
  "/summary",
  protect,
  payrollAccess,
  payrollSummary
);

router.post(
  "/bulk",
  protect,
  payrollAccess,
  validateRequest(bulkPayrollSchema),
  createBulkPayroll
);

router.get(
  "/",
  protect,
  payrollAccess,
  getPayrolls
);

router.post(
  "/",
  protect,
  payrollAccess,
  validateRequest(payrollCreateSchema),
  createPayroll
);

router.patch(
  "/:id/generate",
  protect,
  payrollAccess,
  validateObjectId("id"),
  generatePayroll
);

router.patch(
  "/:id/paid",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.FINANCE
  ),
  validateObjectId("id"),
  validateRequest(payrollPaidSchema),
  markPayrollPaid
);

router.get(
  "/:id",
  protect,
  payrollAccess,
  validateObjectId("id"),
  getPayrollById
);

export default router;

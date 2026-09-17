import { z } from "zod";

import {
  dateString,
  monthString,
  nonNegativeNumber,
  objectId,
} from "./commonValidators.js";

const moneyFields = z
  .object({
    housing:
      nonNegativeNumber.optional(),
    medical:
      nonNegativeNumber.optional(),
    transport:
      nonNegativeNumber.optional(),
    other:
      nonNegativeNumber.optional(),
  })
  .optional();

const deductionFields = z
  .object({
    tax:
      nonNegativeNumber.optional(),

    providentFund:
      nonNegativeNumber.optional(),

    loan:
      nonNegativeNumber.optional(),

    other:
      nonNegativeNumber.optional(),
  })
  .optional();

export const salaryStructureSchema =
  z.object({
    employee: objectId,

    basicSalary:
      nonNegativeNumber,

    allowances: moneyFields,

    deductions:
      deductionFields,

    overtimeHourlyRate:
      nonNegativeNumber.optional(),

    currency: z
      .string()
      .trim()
      .min(3)
      .max(3)
      .optional(),

    effectiveFrom: dateString,

    effectiveTo:
      dateString
        .optional()
        .nullable(),
  });

export const payrollCreateSchema =
  z.object({
    employee: objectId,

    month: monthString,

    overtimeHours:
      nonNegativeNumber.optional(),

    bonus:
      nonNegativeNumber.optional(),

    otherDeduction:
      nonNegativeNumber.optional(),
  });

export const bulkPayrollSchema =
  z.object({
    month: monthString,
  });

export const payrollPaidSchema =
  z.object({
    paymentReference: z
      .string()
      .trim()
      .max(200)
      .optional(),
  });

export const salaryDeactivateSchema =
  z.object({
    effectiveTo: dateString,
  });
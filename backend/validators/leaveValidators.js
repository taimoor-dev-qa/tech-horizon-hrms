import { z } from "zod";

import {
  dateString,
  objectId,
} from "./commonValidators.js";

const leaveTypeBase = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(100),

  code: z
    .string()
    .trim()
    .min(2)
    .max(20),

  annualQuota: z
    .number()
    .min(0),

  isPaid: z
    .boolean()
    .optional(),

  requiresDocument: z
    .boolean()
    .optional(),

  description: z
    .string()
    .trim()
    .max(500)
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

export const createLeaveTypeSchema =
  leaveTypeBase.omit({
    isActive: true,
  });

export const updateLeaveTypeSchema =
  leaveTypeBase.partial();

export const createLeaveRequestSchema =
  z.object({
    leaveType: objectId,
    startDate: dateString,
    endDate: dateString,
    reason: z
      .string()
      .trim()
      .min(3)
      .max(1000),
  });

export const leaveDecisionSchema =
  z.object({
    decision: z.enum([
      "approve",
      "reject",
    ]),
    comment: z
      .string()
      .trim()
      .max(1000)
      .optional(),
  });

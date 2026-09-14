import { z } from "zod";

import {
  dateString,
  objectId,
} from "./commonValidators.js";

export const timesheetSchema = z.object({
  project: objectId,

  workDate: dateString,

  task: z
    .string()
    .trim()
    .min(2, "Task is required")
    .max(500),

  hours: z
    .number()
    .min(0.25)
    .max(24),

  description: z
    .string()
    .trim()
    .max(2000)
    .optional(),
});

export const updateTimesheetSchema =
  timesheetSchema.partial();

export const timesheetDecisionSchema =
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
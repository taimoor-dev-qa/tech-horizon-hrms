import { z } from "zod";

import {
  dateString,
  objectId,
} from "./commonValidators.js";

const timesheetBase = z.object({
  project: objectId,

  workDate: dateString,

  task: z
    .string()
    .trim()
    .min(2)
    .max(300),

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

export const createTimesheetSchema =
  timesheetBase;

export const updateTimesheetSchema =
  timesheetBase.partial();

export const timesheetDecisionSchema =
  z.object({
    decision: z.enum(
      [
        "approve",
        "reject",
      ],
      {
        message:
          "Decision must be approve or reject",
      }
    ),

    comment: z
      .string()
      .trim()
      .max(
        1000,
        "Comment cannot exceed 1000 characters"
      )
      .optional(),
  });
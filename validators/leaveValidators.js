import { z } from "zod";

import {
  dateString,
  objectId,
} from "./commonValidators.js";

export const leaveRequestSchema =
  z.object({
    leaveType: objectId,

    startDate: dateString,

    endDate: dateString,

    reason: z
      .string()
      .trim()
      .min(
        3,
        "Leave reason is required"
      )
      .max(1000),
  })
  .refine(
    (data) =>
      data.startDate <=
      data.endDate,
    {
      message:
        "Start date cannot be after end date",
      path: ["endDate"],
    }
  );

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
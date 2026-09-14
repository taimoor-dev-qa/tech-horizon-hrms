import { z } from "zod";

import {
  dateString,
  objectId,
} from "./commonValidators.js";

const rating = z
  .number()
  .min(1)
  .max(5);

const ratingsSchema = z.object({
  technicalSkills: rating,
  productivity: rating,
  communication: rating,
  teamwork: rating,
  attendance: rating,
});

const performanceBase = z.object({
  employee: objectId,

  periodStart: dateString,

  periodEnd: dateString,

  ratings: ratingsSchema,

  strengths: z
    .string()
    .trim()
    .max(3000)
    .optional(),

  improvements: z
    .string()
    .trim()
    .max(3000)
    .optional(),

  goals: z
    .string()
    .trim()
    .max(3000)
    .optional(),

  reviewerComment: z
    .string()
    .trim()
    .max(3000)
    .optional(),
});

export const performanceReviewSchema =
  performanceBase.refine(
    (data) =>
      data.periodStart <=
      data.periodEnd,
    {
      path: ["periodEnd"],
      message:
        "Period end cannot be before period start",
    }
  );

export const updatePerformanceSchema =
  performanceBase
    .omit({
      employee: true,
    })
    .partial();

export const performanceAcknowledgeSchema =
  z.object({
    comment: z
      .string()
      .trim()
      .max(3000)
      .optional(),
  });
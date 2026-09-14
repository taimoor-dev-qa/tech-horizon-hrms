import { z } from "zod";

import {
  optionalObjectId,
} from "./commonValidators.js";

export const departmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Department name is required")
    .max(100),

  code: z
    .string()
    .trim()
    .min(2, "Department code is required")
    .max(20),

  description: z
    .string()
    .trim()
    .max(1000)
    .optional(),

  manager: optionalObjectId,

  isActive: z
    .boolean()
    .optional(),
});

export const updateDepartmentSchema =
  departmentSchema.partial();
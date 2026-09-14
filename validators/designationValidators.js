import { z } from "zod";

import {
  objectId,
} from "./commonValidators.js";

export const designationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Designation name is required")
    .max(100),

  code: z
    .string()
    .trim()
    .min(2, "Designation code is required")
    .max(20),

  department: objectId,

  description: z
    .string()
    .trim()
    .max(1000)
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

export const updateDesignationSchema =
  designationSchema.partial();
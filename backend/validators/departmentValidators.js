import { z } from "zod";

import {
  optionalObjectId,
} from "./commonValidators.js";

const departmentBase =
  z.object({
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

    description: z
      .string()
      .trim()
      .max(500)
      .optional(),

    manager:
      optionalObjectId,

    isActive: z
      .boolean()
      .optional(),
  });

export const createDepartmentSchema =
  departmentBase.omit({
    isActive: true,
  });

export const updateDepartmentSchema =
  departmentBase.partial();
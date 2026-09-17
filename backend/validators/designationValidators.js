import { z } from "zod";

import {
  objectId,
} from "./commonValidators.js";

const designationBase =
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

    department:
      objectId,

    description: z
      .string()
      .trim()
      .max(500)
      .optional(),

    isActive: z
      .boolean()
      .optional(),
  });

export const createDesignationSchema =
  designationBase.omit({
    isActive: true,
  });

export const updateDesignationSchema =
  designationBase.partial();
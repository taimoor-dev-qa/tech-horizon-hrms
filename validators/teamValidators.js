import { z } from "zod";

import {
  objectId,
  optionalObjectId,
} from "./commonValidators.js";

export const teamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Team name is required")
    .max(100),

  code: z
    .string()
    .trim()
    .min(2, "Team code is required")
    .max(20),

  department: objectId,

  teamLead: optionalObjectId,

  description: z
    .string()
    .trim()
    .max(1000)
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

export const updateTeamSchema =
  teamSchema.partial();
import { z } from "zod";

import {
  objectId,
  optionalObjectId,
} from "./commonValidators.js";

const teamBase = z.object({
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

  department: objectId,

  teamLead: optionalObjectId,

  description: z
    .string()
    .trim()
    .max(500)
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

export const createTeamSchema =
  teamBase.omit({
    isActive: true,
  });

export const updateTeamSchema =
  teamBase.partial();

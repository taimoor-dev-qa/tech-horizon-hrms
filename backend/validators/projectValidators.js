import { z } from "zod";

import {
  PROJECT_PRIORITY,
  PROJECT_STATUS,
} from "../constants/project.js";

import {
  dateString,
  enumValue,
  objectId,
} from "./commonValidators.js";

const projectBase = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(150),

  code: z
    .string()
    .trim()
    .min(2)
    .max(30),

  client: z
    .string()
    .trim()
    .max(150)
    .optional(),

  description: z
    .string()
    .trim()
    .max(2000)
    .optional(),

  manager: objectId,

  members: z
    .array(objectId)
    .optional(),

  startDate: dateString,
  deadline: dateString,

  status: enumValue(
    Object.values(PROJECT_STATUS),
    "Invalid project status"
  ).optional(),

  priority: enumValue(
    Object.values(PROJECT_PRIORITY),
    "Invalid project priority"
  ).optional(),

  isActive: z
    .boolean()
    .optional(),
});

export const createProjectSchema =
  projectBase.omit({
    isActive: true,
  });

export const updateProjectSchema =
  projectBase.partial();

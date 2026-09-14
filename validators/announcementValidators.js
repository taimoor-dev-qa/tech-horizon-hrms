import { z } from "zod";

import {
  ANNOUNCEMENT_AUDIENCE,
  ANNOUNCEMENT_PRIORITY,
} from "../constants/announcement.js";

import ROLES from "../constants/roles.js";

import {
  dateTimeString,
  enumValue,
  objectId,
} from "./commonValidators.js";

const announcementBase = z.object({
  title: z
    .string()
    .trim()
    .min(2)
    .max(200),

  message: z
    .string()
    .trim()
    .min(2)
    .max(5000),

  audience: enumValue(
    Object.values(
      ANNOUNCEMENT_AUDIENCE
    ),
    "Invalid announcement audience"
  ).optional(),

  department:
    objectId.optional().nullable(),

  team:
    objectId.optional().nullable(),

  roles: z
    .array(
      enumValue(
        Object.values(ROLES),
        "Invalid role"
      )
    )
    .optional(),

  priority: enumValue(
    Object.values(
      ANNOUNCEMENT_PRIORITY
    ),
    "Invalid announcement priority"
  ).optional(),

  expiresAt:
    dateTimeString
      .optional()
      .nullable(),
});

export const announcementSchema =
  announcementBase;

export const updateAnnouncementSchema =
  announcementBase.partial();
import { z } from "zod";

import {
  HOLIDAY_TYPES,
} from "../constants/holiday.js";

import {
  dateString,
  enumValue,
} from "./commonValidators.js";

export const holidaySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(150),

  date: dateString,

  type: enumValue(
    Object.values(HOLIDAY_TYPES),
    "Invalid holiday type"
  ).optional(),

  description: z
    .string()
    .trim()
    .max(1000)
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

export const updateHolidaySchema =
  holidaySchema.partial();
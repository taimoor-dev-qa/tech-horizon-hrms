import { z } from "zod";

import {
  HOLIDAY_TYPES,
} from "../constants/holiday.js";

import {
  dateString,
  enumValue,
} from "./commonValidators.js";

const holidayBase = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(150),

  date: dateString,

  type: enumValue(
    Object.values(HOLIDAY_TYPES),
    "Invalid holiday type"
  ),

  description: z
    .string()
    .trim()
    .max(500)
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

export const createHolidaySchema =
  holidayBase.omit({
    isActive: true,
  });

export const updateHolidaySchema =
  holidayBase.partial();

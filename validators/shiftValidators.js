import { z } from "zod";

const timeString = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    "Time must use HH:MM format"
  );

const workingDay = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

export const shiftSchema = z.object({
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

  startTime: timeString,

  endTime: timeString,

  breakMinutes: z
    .number()
    .int()
    .min(0)
    .optional(),

  graceMinutes: z
    .number()
    .int()
    .min(0)
    .optional(),

  workingDays: z
    .array(workingDay)
    .min(1, "At least one working day is required"),

  isNightShift: z
    .boolean()
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

export const updateShiftSchema =
  shiftSchema.partial();
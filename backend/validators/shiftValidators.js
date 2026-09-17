import { z } from "zod";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const timeString = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    "Time must use HH:MM format"
  );

const workingDays = z
  .array(
    z.string().refine(
      (value) => DAYS.includes(value),
      "Invalid working day"
    )
  )
  .min(1, "At least one working day is required");

const shiftBase = z.object({
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
    .min(0)
    .optional(),

  graceMinutes: z
    .number()
    .min(0)
    .optional(),

  workingDays,

  isNightShift: z
    .boolean()
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

export const createShiftSchema =
  shiftBase.omit({
    isActive: true,
  });

export const updateShiftSchema =
  shiftBase.partial();

import { z } from "zod";

const emailOrEmpty = z.union([
  z.literal(""),
  z.string().email(
    "Invalid company email"
  ),
]);

const websiteOrEmpty = z.union([
  z.literal(""),
  z.string().url(
    "Invalid website URL"
  ),
]);

export const companySettingsSchema =
  z.object({
    companyName: z
      .string()
      .trim()
      .min(2)
      .max(200)
      .optional(),

    companyEmail:
      emailOrEmpty.optional(),

    companyPhone: z
      .string()
      .trim()
      .max(50)
      .optional(),

    address: z
      .string()
      .trim()
      .max(500)
      .optional(),

    website:
      websiteOrEmpty.optional(),

    timezone: z
      .string()
      .trim()
      .min(2)
      .optional(),

    currency: z
      .string()
      .trim()
      .length(3)
      .optional(),

    attendance: z
      .object({
        graceMinutes: z
          .number()
          .int()
          .min(0)
          .optional(),

        halfDayAfterMinutes: z
          .number()
          .int()
          .min(0)
          .optional(),

        allowManualAttendance:
          z.boolean().optional(),
      })
      .optional(),

    payroll: z
      .object({
        payrollDay: z
          .number()
          .int()
          .min(1)
          .max(31)
          .optional(),

        overtimeEnabled:
          z.boolean().optional(),

        deductAbsence:
          z.boolean().optional(),

        deductUnpaidLeave:
          z.boolean().optional(),
      })
      .optional(),

    leave: z
      .object({
        leaveYearStartMonth: z
          .number()
          .int()
          .min(1)
          .max(12)
          .optional(),

        allowPastDateRequest:
          z.boolean().optional(),

        managerApprovalRequired:
          z.boolean().optional(),

        hrApprovalRequired:
          z.boolean().optional(),
      })
      .optional(),
  });
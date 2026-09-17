import { z } from "zod";

import {
  ATTENDANCE_STATUS,
} from "../constants/attendance.js";

import {
  dateString,
  enumValue,
  objectId,
} from "./commonValidators.js";

const attendanceStatus = enumValue(
  Object.values(ATTENDANCE_STATUS),
  "Invalid attendance status"
);

export const manualAttendanceSchema =
  z.object({
    employeeId: objectId,
    attendanceDate: dateString,
    status: attendanceStatus,
    notes: z
      .string()
      .trim()
      .max(500)
      .optional(),
  });

export const attendanceStatusSchema =
  z.object({
    status: attendanceStatus,
    notes: z
      .string()
      .trim()
      .max(500)
      .optional(),
  });

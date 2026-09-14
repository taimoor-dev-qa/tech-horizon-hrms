import { z } from "zod";

import {
  ATTENDANCE_STATUS,
} from "../constants/attendance.js";

import {
  dateString,
  enumValue,
  objectId,
} from "./commonValidators.js";

export const manualAttendanceSchema =
  z.object({
    employeeId: objectId,

    date: dateString,

    status: enumValue(
      Object.values(
        ATTENDANCE_STATUS
      ),
      "Invalid attendance status"
    ),

    notes: z
      .string()
      .trim()
      .max(500)
      .optional(),
  });

export const attendanceStatusSchema =
  z.object({
    status: enumValue(
      Object.values(
        ATTENDANCE_STATUS
      ),
      "Invalid attendance status"
    ),
  });
import AppError from "../utils/AppError.js";
import Attendance
  from "../models/Attendance.js";

import Employee
  from "../models/Employee.js";

import {
  ATTENDANCE_STATUS,
} from "../constants/attendance.js";

import {
  getRuntimeCompanySettings,
} from "./companySettingsRuntimeService.js";
import { mapDuplicateKeyError } from "../utils/mongoDuplicateKey.js";

const duplicateConstraints = [
  {
    fields: ["employee", "attendanceDate"],
    message: "Attendance already exists for this employee and date",
  },
];

const MANUAL_STATUSES = [
  ATTENDANCE_STATUS.PRESENT,
  ATTENDANCE_STATUS.LATE,
  ATTENDANCE_STATUS.ABSENT,
  ATTENDANCE_STATUS.HALF_DAY,
  ATTENDANCE_STATUS.ON_LEAVE,
  ATTENDANCE_STATUS.WORK_FROM_HOME,
];

const validateManualAttendance =
  async () => {
    const settings =
      await getRuntimeCompanySettings();

    if (
      !settings.attendance
        .allowManualAttendance
    ) {
      throw new AppError("Manual attendance is disabled in company settings", 400);
    }
  };

const getEmployee = async (
  employeeId
) => {
  const employee =
    await Employee.findById(
      employeeId
    ).populate("shift");

  if (!employee) {
    throw new AppError("Employee not found", 400);
  }

  if (!employee.shift) {
    throw new AppError("Employee does not have a shift assigned", 400);
  }

  return employee;
};

export const markManualAttendance =
  async ({
    employeeId,
    attendanceDate,
    status,
    notes = "",
  }) => {
    await validateManualAttendance();

    if (
      !employeeId ||
      !attendanceDate ||
      !status
    ) {
      throw new AppError("Employee, date and status are required", 400);
    }

    if (
      !MANUAL_STATUSES.includes(
        status
      )
    ) {
      throw new AppError("Invalid attendance status", 400);
    }

    const employee =
      await getEmployee(employeeId);

    try {
      return await Attendance.findOneAndUpdate(
        {
          employee: employee._id,
          attendanceDate,
        },
        {
          employee: employee._id,
          shift: employee.shift._id,
          attendanceDate,
          status,
          notes,
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );
    } catch (error) {
      throw mapDuplicateKeyError(error, duplicateConstraints);
    }
  };

export const updateAttendanceStatus =
  async (
    attendanceId,
    data
  ) => {
    await validateManualAttendance();

    if (
      data.status &&
      !MANUAL_STATUSES.includes(
        data.status
      )
    ) {
      throw new AppError("Invalid attendance status", 400);
    }

    return Attendance.findByIdAndUpdate(
      attendanceId,
      {
        status: data.status,
        notes: data.notes,
      },
      {
        new: true,
        runValidators: true,
      }
    );
  };

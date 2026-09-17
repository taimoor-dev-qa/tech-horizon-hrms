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
      throw new Error(
        "Manual attendance is disabled in company settings"
      );
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
    throw new Error(
      "Employee not found"
    );
  }

  if (!employee.shift) {
    throw new Error(
      "Employee does not have a shift assigned"
    );
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
      throw new Error(
        "Employee, date and status are required"
      );
    }

    if (
      !MANUAL_STATUSES.includes(
        status
      )
    ) {
      throw new Error(
        "Invalid attendance status"
      );
    }

    const employee =
      await getEmployee(employeeId);

    return Attendance.findOneAndUpdate(
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
      throw new Error(
        "Invalid attendance status"
      );
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
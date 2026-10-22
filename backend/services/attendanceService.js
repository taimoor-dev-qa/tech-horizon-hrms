import AppError from "../utils/AppError.js";
import Attendance
  from "../models/Attendance.js";

import Employee
  from "../models/Employee.js";
import Shift
  from "../models/Shift.js";

import {
  ATTENDANCE_STATUS,
} from "../constants/attendance.js";

import {
  calculateLateMinutes,
  calculateWorkingMinutes,
  getAttendanceStatus,
  getCurrentDate,
  getPreviousDate,
} from "./attendanceTimeService.js";

import {
  getRuntimeCompanySettings,
} from "./companySettingsRuntimeService.js";
import { mapDuplicateKeyError } from "../utils/mongoDuplicateKey.js";

const duplicateConstraints = [
  {
    fields: ["employee", "attendanceDate"],
    message: "You have already checked in today",
  },
];

const getEmployee = async (
  userId
) => {
  const employee =
    await Employee.findOne({
      user: userId,
    }).populate("shift");

  if (!employee) {
    throw new AppError("Employee profile not found", 400);
  }

  if (!employee.shift) {
    throw new AppError("No shift assigned to employee", 400);
  }

  return employee;
};

export const checkIn = async (
  userId
) => {
  const employee =
    await getEmployee(userId);

  const settings =
    await getRuntimeCompanySettings();

  const attendanceDate =
    getCurrentDate(
      settings.timezone
    );

  const existingAttendance =
    await Attendance.findOne({
      employee: employee._id,
      attendanceDate,
    });

  if (existingAttendance) {
    throw new AppError("You have already checked in today", 400);
  }

  const checkInTime =
    new Date();

  const lateMinutes =
    calculateLateMinutes(
      checkInTime,
      employee.shift,
      attendanceDate,
      settings.attendance
        .graceMinutes,
      settings.timezone
    );

  const status =
    getAttendanceStatus(
      lateMinutes
    );

  try {
    return await Attendance.create({
      employee: employee._id,
      shift: employee.shift._id,
      attendanceDate,
      checkIn: checkInTime,
      lateMinutes,
      status,
    });
  } catch (error) {
    throw mapDuplicateKeyError(error, duplicateConstraints);
  }
};

export const checkOut = async (
  userId
) => {
  const employee =
    await getEmployee(userId);

  const settings =
    await getRuntimeCompanySettings();

  const attendanceDate =
    getCurrentDate(
      settings.timezone
    );

  let attendance =
    await Attendance.findOne({
      employee: employee._id,
      attendanceDate,
    });

  if (!attendance) {
    const previousAttendance =
      await Attendance.findOne({
        employee: employee._id,
        attendanceDate:
          getPreviousDate(
            attendanceDate
          ),
      });

    if (previousAttendance) {
      const recordedShiftId =
        previousAttendance.shift?._id ||
        previousAttendance.shift;

      const recordedShift =
        await Shift.findById(
          recordedShiftId
        ).select("isNightShift");

      if (recordedShift?.isNightShift) {
        attendance = previousAttendance;
      }
    }
  }

  if (!attendance) {
    throw new AppError("Please check in before checking out", 400);
  }

  if (attendance.checkOut) {
    throw new AppError("You have already checked out today", 400);
  }

  const checkOutTime =
    new Date();

  attendance.checkOut =
    checkOutTime;

  attendance.workingMinutes =
    calculateWorkingMinutes(
      attendance.checkIn,
      checkOutTime
    );

  const halfDayMinutes =
    settings.attendance
      .halfDayAfterMinutes;

  if (
    halfDayMinutes > 0 &&
    attendance.workingMinutes <
      halfDayMinutes
  ) {
    attendance.status =
      ATTENDANCE_STATUS.HALF_DAY;
  }

  await attendance.save();

  return attendance;
};

export const getMyAttendance = async (
  userId
) => {
  const employee =
    await Employee.findOne({
      user: userId,
    });

  if (!employee) {
    throw new AppError("Employee profile not found", 400);
  }

  return Attendance.find({
    employee: employee._id,
  })
    .populate(
      "shift",
      "name startTime endTime"
    )
    .sort({
      attendanceDate: -1,
    });
};

import Attendance
  from "../models/Attendance.js";

import Employee
  from "../models/Employee.js";

import {
  ATTENDANCE_STATUS,
} from "../constants/attendance.js";

import {
  calculateLateMinutes,
  calculateWorkingMinutes,
  getAttendanceStatus,
  getCurrentDate,
} from "./attendanceTimeService.js";

import {
  getRuntimeCompanySettings,
} from "./companySettingsRuntimeService.js";

const getEmployee = async (
  userId
) => {
  const employee =
    await Employee.findOne({
      user: userId,
    }).populate("shift");

  if (!employee) {
    throw new Error(
      "Employee profile not found"
    );
  }

  if (!employee.shift) {
    throw new Error(
      "No shift assigned to employee"
    );
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
    throw new Error(
      "You have already checked in today"
    );
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

  return Attendance.create({
    employee: employee._id,
    shift: employee.shift._id,
    attendanceDate,
    checkIn: checkInTime,
    lateMinutes,
    status,
  });
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

  const attendance =
    await Attendance.findOne({
      employee: employee._id,
      attendanceDate,
    });

  if (!attendance) {
    throw new Error(
      "Please check in before checking out"
    );
  }

  if (attendance.checkOut) {
    throw new Error(
      "You have already checked out today"
    );
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
    throw new Error(
      "Employee profile not found"
    );
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
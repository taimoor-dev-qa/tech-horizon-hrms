import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

import {
  calculateLateMinutes,
  calculateWorkingMinutes,
  getAttendanceStatus,
  getCurrentDate,
} from "./attendanceTimeService.js";

const getEmployee = async (userId) => {
  const employee = await Employee.findOne({
    user: userId,
  }).populate("shift");

  if (!employee) {
    throw new Error("Employee profile not found");
  }

  if (!employee.shift) {
    throw new Error(
      "No shift assigned to employee"
    );
  }

  return employee;
};

export const checkIn = async (userId) => {
  const employee = await getEmployee(userId);

  const attendanceDate = getCurrentDate();

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

  const checkInTime = new Date();

  const lateMinutes = calculateLateMinutes(
    checkInTime,
    employee.shift,
    attendanceDate
  );

  const status =
    getAttendanceStatus(lateMinutes);

  return Attendance.create({
    employee: employee._id,
    shift: employee.shift._id,
    attendanceDate,
    checkIn: checkInTime,
    lateMinutes,
    status,
  });
};

export const checkOut = async (userId) => {
  const employee = await getEmployee(userId);

  const attendanceDate = getCurrentDate();

  const attendance = await Attendance.findOne({
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

  const checkOutTime = new Date();

  attendance.checkOut = checkOutTime;

  attendance.workingMinutes =
    calculateWorkingMinutes(
      attendance.checkIn,
      checkOutTime
    );

  await attendance.save();

  return attendance;
};

export const getMyAttendance = async (
  userId
) => {
  const employee = await Employee.findOne({
    user: userId,
  });

  if (!employee) {
    throw new Error("Employee profile not found");
  }

  return Attendance.find({
    employee: employee._id,
  })
    .populate(
      "shift",
      "name startTime endTime"
    )
    .sort({ attendanceDate: -1 });
};
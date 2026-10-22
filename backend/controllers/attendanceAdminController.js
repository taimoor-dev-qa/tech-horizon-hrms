import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getAttendanceList,
  getAttendanceSummary,
} from "../services/attendanceQueryService.js";

import {
  markManualAttendance,
  updateAttendanceStatus,
} from "../services/attendanceAdminService.js";

export const getAttendance = asyncHandler(async (req, res) => {
  const result =
    await getAttendanceList(
      req.user,
      req.query
    );

  res.status(200).json({
    success: true,
    ...result,
  });
});

export const getDailySummary = asyncHandler(async (req, res) => {
  if (!req.query.date) {
    throw new AppError("Date is required", 400);
  }

  const summary =
    await getAttendanceSummary(
      req.user,
      req.query.date
    );

  res.status(200).json({
    success: true,
    date: req.query.date,
    summary,
  });
});

export const createManualAttendance = asyncHandler(async (req, res) => {
  const attendance =
    await markManualAttendance(
      req.body
    );

  res.status(200).json({
    success: true,
    message:
      "Attendance marked successfully",
    attendance,
  });
});

export const changeAttendanceStatus = asyncHandler(async (req, res) => {
  const attendance =
    await updateAttendanceStatus(
      req.params.id,
      req.body
    );

  if (!attendance) {
    throw new AppError("Attendance record not found", 404);
  }

  res.status(200).json({
    success: true,
    message:
      "Attendance updated successfully",
    attendance,
  });
});

import asyncHandler from "../utils/asyncHandler.js";
import * as attendanceService
  from "../services/attendanceService.js";

export const checkIn = asyncHandler(async (req, res) => {
  const attendance =
    await attendanceService.checkIn(
      req.user._id
    );

  res.status(201).json({
    success: true,
    message: "Check-in successful",
    attendance,
  });
});

export const checkOut = asyncHandler(async (req, res) => {
  const attendance =
    await attendanceService.checkOut(
      req.user._id
    );

  res.status(200).json({
    success: true,
    message: "Check-out successful",
    attendance,
  });
});

export const getMyAttendance = asyncHandler(async (req, res) => {
  const attendance =
    await attendanceService.getMyAttendance(
      req.user._id
    );

  res.status(200).json({
    success: true,
    count: attendance.length,
    attendance,
  });
});

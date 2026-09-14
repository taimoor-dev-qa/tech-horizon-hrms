import * as attendanceService
  from "../services/attendanceService.js";

export const checkIn = async (req, res) => {
  try {
    const attendance =
      await attendanceService.checkIn(
        req.user._id
      );

    res.status(201).json({
      success: true,
      message: "Check-in successful",
      attendance,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkOut = async (req, res) => {
  try {
    const attendance =
      await attendanceService.checkOut(
        req.user._id
      );

    res.status(200).json({
      success: true,
      message: "Check-out successful",
      attendance,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyAttendance = async (
  req,
  res
) => {
  try {
    const attendance =
      await attendanceService.getMyAttendance(
        req.user._id
      );

    res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
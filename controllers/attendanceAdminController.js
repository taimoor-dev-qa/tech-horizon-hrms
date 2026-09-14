import {
  getAttendanceList,
  getAttendanceSummary,
} from "../services/attendanceQueryService.js";

import {
  markManualAttendance,
  updateAttendanceStatus,
} from "../services/attendanceAdminService.js";

export const getAttendance = async (
  req,
  res
) => {
  try {
    const result =
      await getAttendanceList(req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDailySummary = async (
  req,
  res
) => {
  try {
    if (!req.query.date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const summary =
      await getAttendanceSummary(
        req.query.date
      );

    res.status(200).json({
      success: true,
      date: req.query.date,
      summary,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const createManualAttendance = async (
  req,
  res
) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const changeAttendanceStatus = async (
  req,
  res
) => {
  try {
    const attendance =
      await updateAttendanceStatus(
        req.params.id,
        req.body
      );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message:
          "Attendance record not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Attendance updated successfully",
      attendance,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
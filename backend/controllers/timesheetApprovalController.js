import {
  getManagerPendingTimesheets,
  reviewTimesheet,
} from "../services/timesheetApprovalService.js";

export const getPendingTimesheets = async (
  req,
  res
) => {
  try {
    const timesheets =
      await getManagerPendingTimesheets(
        req.user._id
      );

    res.status(200).json({
      success: true,
      count: timesheets.length,
      timesheets,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const reviewEmployeeTimesheet = async (
  req,
  res
) => {
  try {
    const timesheet = await reviewTimesheet(
      req.params.id,
      req.user,
      req.body.decision,
      req.body.comment
    );

    res.status(200).json({
      success: true,
      message:
        "Timesheet reviewed successfully",
      timesheet,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
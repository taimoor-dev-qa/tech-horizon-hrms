import asyncHandler from "../utils/asyncHandler.js";
import {
  getManagerPendingTimesheets,
  reviewTimesheet,
} from "../services/timesheetApprovalService.js";

export const getPendingTimesheets = asyncHandler(async (req, res) => {
  const timesheets =
    await getManagerPendingTimesheets(
      req.user
    );

  res.status(200).json({
    success: true,
    count: timesheets.length,
    timesheets,
  });
});

export const reviewEmployeeTimesheet = asyncHandler(async (req, res) => {
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
});

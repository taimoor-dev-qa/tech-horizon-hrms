import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createTimesheet as createService,
  deleteTimesheet as deleteService,
  updateTimesheet as updateService,
} from "../services/timesheetService.js";

import {
  getMyTimesheets as getMyService,
} from "../services/timesheetQueryService.js";

export const createTimesheet = asyncHandler(async (req, res) => {
  const timesheet = await createService(
    req.user._id,
    req.body
  );

  res.status(201).json({
    success: true,
    message:
      "Timesheet submitted successfully",
    timesheet,
  });
});

export const getMyTimesheets = asyncHandler(async (req, res) => {
  const result =
    await getMyService(
      req.user._id,
      req.query
    );

  res.status(200).json({
    success: true,

    count:
      result
        .timesheets
        .length,

    pagination:
      result.pagination,

    timesheets:
      result.timesheets,
  });
});

export const updateTimesheet = asyncHandler(async (req, res) => {
  const timesheet = await updateService(
    req.user._id,
    req.params.id,
    req.body
  );

  if (!timesheet) {
    throw new AppError("Timesheet not found", 404);
  }

  res.status(200).json({
    success: true,
    message:
      "Timesheet updated successfully",
    timesheet,
  });
});

export const deleteTimesheet = asyncHandler(async (req, res) => {
  const timesheet = await deleteService(
    req.user._id,
    req.params.id
  );

  if (!timesheet) {
    throw new AppError("Timesheet not found", 404);
  }

  res.status(200).json({
    success: true,
    message:
      "Timesheet deleted successfully",
  });
});

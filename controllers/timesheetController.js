import {
  createTimesheet as createService,
  deleteTimesheet as deleteService,
  updateTimesheet as updateService,
} from "../services/timesheetService.js";

import {
  getMyTimesheets as getMyService,
} from "../services/timesheetQueryService.js";

export const createTimesheet = async (
  req,
  res
) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyTimesheets = async (
  req,
  res
) => {
  try {
    const timesheets = await getMyService(
      req.user._id,
      req.query
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

export const updateTimesheet = async (
  req,
  res
) => {
  try {
    const timesheet = await updateService(
      req.user._id,
      req.params.id,
      req.body
    );

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: "Timesheet not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Timesheet updated successfully",
      timesheet,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteTimesheet = async (
  req,
  res
) => {
  try {
    const timesheet = await deleteService(
      req.user._id,
      req.params.id
    );

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: "Timesheet not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Timesheet deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
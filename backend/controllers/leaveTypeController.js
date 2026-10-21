import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import * as leaveTypeService
  from "../services/leaveTypeService.js";

export const createLeaveType = asyncHandler(async (req, res) => {
  const leaveType =
    await leaveTypeService.createLeaveType(
      req.body
    );

  res.status(201).json({
    success: true,
    message:
      "Leave type created successfully",
    leaveType,
  });
});

export const getLeaveTypes = asyncHandler(async (req, res) => {
  const leaveTypes =
    await leaveTypeService.getLeaveTypes();

  res.status(200).json({
    success: true,
    count: leaveTypes.length,
    leaveTypes,
  });
});

export const updateLeaveType = asyncHandler(async (req, res) => {
  const leaveType =
    await leaveTypeService.updateLeaveType(
      req.params.id,
      req.body
    );

  if (!leaveType) {
    throw new AppError("Leave type not found", 404);
  }

  res.status(200).json({
    success: true,
    message:
      "Leave type updated successfully",
    leaveType,
  });
});

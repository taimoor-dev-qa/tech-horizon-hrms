import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import * as shiftService
  from "../services/shiftService.js";

export const createShift = asyncHandler(async (req, res) => {
  const shift =
    await shiftService.createShift(req.body);

  res.status(201).json({
    success: true,
    message: "Shift created successfully",
    shift,
  });
});

export const getShifts = asyncHandler(async (req, res) => {
  const shifts =
    await shiftService.getShifts();

  res.status(200).json({
    success: true,
    count: shifts.length,
    shifts,
  });
});

export const getShiftById = asyncHandler(async (req, res) => {
  const shift =
    await shiftService.getShiftById(
      req.params.id
    );

  if (!shift) {
    throw new AppError("Shift not found", 404);
  }

  res.status(200).json({
    success: true,
    shift,
  });
});

export const updateShift = asyncHandler(async (req, res) => {
  const shift =
    await shiftService.updateShift(
      req.params.id,
      req.body
    );

  if (!shift) {
    throw new AppError("Shift not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Shift updated successfully",
    shift,
  });
});

export const deleteShift = asyncHandler(async (req, res) => {
  const shift =
    await shiftService.deleteShift(
      req.params.id
    );

  if (!shift) {
    throw new AppError("Shift not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Shift deleted successfully",
  });
});

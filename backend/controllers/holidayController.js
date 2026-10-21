import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import * as holidayService
  from "../services/holidayService.js";

export const createHoliday = asyncHandler(async (req, res) => {
  const holiday =
    await holidayService.createHoliday(
      req.body
    );

  res.status(201).json({
    success: true,
    message: "Holiday created successfully",
    holiday,
  });
});

export const getHolidays = asyncHandler(async (req, res) => {
  const holidays =
    await holidayService.getHolidays(
      req.query
    );

  res.status(200).json({
    success: true,
    count: holidays.length,
    holidays,
  });
});

export const updateHoliday = asyncHandler(async (req, res) => {
  const holiday =
    await holidayService.updateHoliday(
      req.params.id,
      req.body
    );

  if (!holiday) {
    throw new AppError("Holiday not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Holiday updated successfully",
    holiday,
  });
});

export const deleteHoliday = asyncHandler(async (req, res) => {
  const holiday =
    await holidayService.deleteHoliday(
      req.params.id
    );

  if (!holiday) {
    throw new AppError("Holiday not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Holiday deleted successfully",
  });
});

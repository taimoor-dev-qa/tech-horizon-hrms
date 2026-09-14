import * as shiftService
  from "../services/shiftService.js";

export const createShift = async (
  req,
  res
) => {
  try {
    const shift =
      await shiftService.createShift(req.body);

    res.status(201).json({
      success: true,
      message: "Shift created successfully",
      shift,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getShifts = async (
  req,
  res
) => {
  try {
    const shifts =
      await shiftService.getShifts();

    res.status(200).json({
      success: true,
      count: shifts.length,
      shifts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getShiftById = async (
  req,
  res
) => {
  try {
    const shift =
      await shiftService.getShiftById(
        req.params.id
      );

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    res.status(200).json({
      success: true,
      shift,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateShift = async (
  req,
  res
) => {
  try {
    const shift =
      await shiftService.updateShift(
        req.params.id,
        req.body
      );

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Shift updated successfully",
      shift,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteShift = async (
  req,
  res
) => {
  try {
    const shift =
      await shiftService.deleteShift(
        req.params.id
      );

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Shift deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
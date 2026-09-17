import * as leaveTypeService
  from "../services/leaveTypeService.js";

export const createLeaveType = async (
  req,
  res
) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLeaveTypes = async (
  req,
  res
) => {
  try {
    const leaveTypes =
      await leaveTypeService.getLeaveTypes();

    res.status(200).json({
      success: true,
      count: leaveTypes.length,
      leaveTypes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateLeaveType = async (
  req,
  res
) => {
  try {
    const leaveType =
      await leaveTypeService.updateLeaveType(
        req.params.id,
        req.body
      );

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Leave type updated successfully",
      leaveType,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
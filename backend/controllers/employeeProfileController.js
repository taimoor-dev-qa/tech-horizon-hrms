import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getEmployeeByUserId,
} from "../services/employeeQueryService.js";

export const getMyProfile = asyncHandler(async (req, res) => {
  const employee =
    await getEmployeeByUserId(
      req.user._id
    );

  if (!employee) {
    throw new AppError("Employee profile not found", 404);
  }

  res.status(200).json({
    success: true,
    employee,
  });
});

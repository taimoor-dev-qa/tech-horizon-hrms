import asyncHandler from "../utils/asyncHandler.js";
import {
  getAdminDashboard,
} from "../services/adminDashboardService.js";

import {
  getEmployeeDashboard,
} from "../services/employeeDashboardService.js";

export const adminDashboard = asyncHandler(async (req, res) => {
  const dashboard =
    await getAdminDashboard();

  res.status(200).json({
    success: true,
    dashboard,
  });
});

export const employeeDashboard = asyncHandler(async (req, res) => {
  const dashboard =
    await getEmployeeDashboard(
      req.user._id
    );

  res.status(200).json({
    success: true,
    dashboard,
  });
});

import {
  getAdminDashboard,
} from "../services/adminDashboardService.js";

import {
  getEmployeeDashboard,
} from "../services/employeeDashboardService.js";

export const adminDashboard = async (
  req,
  res
) => {
  try {
    const dashboard =
      await getAdminDashboard();

    res.status(200).json({
      success: true,
      dashboard,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const employeeDashboard = async (
  req,
  res
) => {
  try {
    const dashboard =
      await getEmployeeDashboard(
        req.user._id
      );

    res.status(200).json({
      success: true,
      dashboard,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
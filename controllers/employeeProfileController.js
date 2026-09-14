import {
  getEmployeeByUserId,
} from "../services/employeeQueryService.js";

export const getMyProfile = async (
  req,
  res
) => {
  try {
    const employee =
      await getEmployeeByUserId(
        req.user._id
      );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found",
      });
    }

    res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
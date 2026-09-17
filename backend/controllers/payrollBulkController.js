import {
  generateBulkPayroll,
} from "../services/payrollBulkService.js";

export const createBulkPayroll = async (
  req,
  res
) => {
  try {
    const results =
      await generateBulkPayroll(
        req.body.month,
        req.user._id
      );

    res.status(200).json({
      success: true,
      message:
        "Bulk payroll processing completed",
      results,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
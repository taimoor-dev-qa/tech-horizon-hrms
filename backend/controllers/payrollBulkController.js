import asyncHandler from "../utils/asyncHandler.js";
import {
  generateBulkPayroll,
} from "../services/payrollBulkService.js";

export const createBulkPayroll = asyncHandler(async (req, res) => {
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
});

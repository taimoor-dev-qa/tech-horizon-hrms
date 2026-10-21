import asyncHandler from "../utils/asyncHandler.js";
import {
  getPayrollSummary,
} from "../services/payrollSummaryService.js";

export const payrollSummary = asyncHandler(async (req, res) => {
  const summary =
    await getPayrollSummary(
      req.query.month
    );

  res.status(200).json({
    success: true,
    summary,
  });
});

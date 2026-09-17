import {
  getPayrollSummary,
} from "../services/payrollSummaryService.js";

export const payrollSummary = async (
  req,
  res
) => {
  try {
    const summary =
      await getPayrollSummary(
        req.query.month
      );

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
import {
  getMyPayslip,
} from "../services/payslipService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getEmployeePayslip = asyncHandler(async (req, res) => {
    const payslip = await getMyPayslip(
      req.user._id,
      req.params.id
    );

    res.status(200).json({
      success: true,
      payslip,
    });
});

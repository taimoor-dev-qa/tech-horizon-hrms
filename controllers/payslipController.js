import {
  getMyPayslip,
} from "../services/payslipService.js";

export const getEmployeePayslip = async (
  req,
  res
) => {
  try {
    const payslip = await getMyPayslip(
      req.user._id,
      req.params.id
    );

    res.status(200).json({
      success: true,
      payslip,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};
import {
  generatePayroll as generateService,
  markPayrollPaid as paidService,
} from "../services/payrollPaymentService.js";

export const generatePayroll = async (
  req,
  res
) => {
  try {
    const payroll = await generateService(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message:
        "Payroll generated successfully",
      payroll,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const markPayrollPaid = async (
  req,
  res
) => {
  try {
    const payroll = await paidService(
      req.params.id,
      req.body.paymentReference
    );

    res.status(200).json({
      success: true,
      message:
        "Payroll marked as paid",
      payroll,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
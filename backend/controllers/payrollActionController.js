import asyncHandler from "../utils/asyncHandler.js";
import {
  generatePayroll as generateService,
  markPayrollPaid as paidService,
} from "../services/payrollPaymentService.js";

export const generatePayroll = asyncHandler(async (req, res) => {
  const payroll = await generateService(
    req.params.id
  );

  res.status(200).json({
    success: true,
    message:
      "Payroll generated successfully",
    payroll,
  });
});

export const markPayrollPaid = asyncHandler(async (req, res) => {
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
});

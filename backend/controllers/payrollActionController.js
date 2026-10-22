import asyncHandler from "../utils/asyncHandler.js";
import {
  generatePayroll as generateService,
  markPayrollPaid as paidService,
} from "../services/payrollPaymentService.js";
import {
  recalculateDraftPayroll as recalculateService,
} from "../services/payrollService.js";
import AppError from "../utils/AppError.js";

export const recalculateDraftPayroll = asyncHandler(async (req, res) => {
  const payroll = await recalculateService(
    req.params.id,
    req.body
  );

  if (!payroll) {
    throw new AppError("Payroll not found", 404);
  }

  res.status(200).json({
    success: true,
    message:
      "Draft payroll recalculated successfully",
    payroll,
  });
});

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

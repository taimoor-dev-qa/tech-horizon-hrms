import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createPayroll as createService,
} from "../services/payrollService.js";

import {
  getMyPayrolls as getMyService,
  getPayrollById as getByIdService,
  getPayrolls as getPayrollsService,
} from "../services/payrollQueryService.js";

export const createPayroll = asyncHandler(async (req, res) => {
  const payroll = await createService(
    req.body,
    req.user._id
  );

  res.status(201).json({
    success: true,
    message:
      "Payroll created successfully",
    payroll,
  });
});

export const getPayrolls = asyncHandler(async (req, res) => {
  const result =
    await getPayrollsService(
      req.query
    );

  res.status(200).json({
    success: true,

    count:
      result
        .payrolls
        .length,

    pagination:
      result.pagination,

    payrolls:
      result.payrolls,
  });
});

export const getMyPayrolls = asyncHandler(async (req, res) => {
  const result =
    await getMyService(
      req.user._id,
      req.query
    );

  res.status(200).json({
    success: true,

    count:
      result
        .payrolls
        .length,

    pagination:
      result.pagination,

    payrolls:
      result.payrolls,
  });
});

export const getPayrollById = asyncHandler(async (req, res) => {
  const payroll = await getByIdService(
    req.params.id
  );

  if (!payroll) {
    throw new AppError("Payroll not found", 404);
  }

  res.status(200).json({
    success: true,
    payroll,
  });
});

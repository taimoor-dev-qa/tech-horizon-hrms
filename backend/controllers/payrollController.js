import {
  createPayroll as createService,
} from "../services/payrollService.js";

import {
  getMyPayrolls as getMyService,
  getPayrollById as getByIdService,
  getPayrolls as getPayrollsService,
} from "../services/payrollQueryService.js";

export const createPayroll = async (
  req,
  res
) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPayrolls = async (
  req,
  res
) => {
  try {
    const payrolls =
      await getPayrollsService(req.query);

    res.status(200).json({
      success: true,
      count: payrolls.length,
      payrolls,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyPayrolls = async (
  req,
  res
) => {
  try {
    const payrolls =
      await getMyService(req.user._id);

    res.status(200).json({
      success: true,
      count: payrolls.length,
      payrolls,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPayrollById = async (
  req,
  res
) => {
  try {
    const payroll = await getByIdService(
      req.params.id
    );

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    res.status(200).json({
      success: true,
      payroll,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
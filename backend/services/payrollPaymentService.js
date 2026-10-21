import AppError from "../utils/AppError.js";
import {
  notifyPayrollGenerated,
  notifyPayrollPaid,
} from "./payrollNotificationService.js";

import Payroll
  from "../models/Payroll.js";

import {
  PAYROLL_STATUS,
} from "../constants/payroll.js";

import {
  validatePayrollGenerationDay,
} from "./payrollPolicyService.js";

export const generatePayroll =
  async (id) => {
    const payroll =
      await Payroll.findById(id);

    if (!payroll) {
      throw new AppError("Payroll not found", 400);
    }

    if (
      payroll.status !==
      PAYROLL_STATUS.DRAFT
    ) {
      throw new AppError("Only draft payroll can be generated", 400);
    }

    await validatePayrollGenerationDay(
      payroll.month
    );

    payroll.status =
      PAYROLL_STATUS.GENERATED;

    payroll.generatedAt =
      new Date();

    await payroll.save();

    await notifyPayrollGenerated(
      payroll
    );

    return payroll;
  };

export const markPayrollPaid =
  async (
    id,
    paymentReference
  ) => {
    const payroll =
      await Payroll.findById(id);

    if (!payroll) {
      throw new AppError("Payroll not found", 400);
    }

    if (
      payroll.status !==
      PAYROLL_STATUS.GENERATED
    ) {
      throw new AppError("Only generated payroll can be marked as paid", 400);
    }

    payroll.status =
      PAYROLL_STATUS.PAID;

    payroll.paidAt =
      new Date();

    payroll.paymentReference =
      paymentReference || "";

    await payroll.save();

    await notifyPayrollPaid(
      payroll
    );

    return payroll;
  };

import Payroll from "../models/Payroll.js";

import {
  validatePayrollMonth,
} from "./payrollValidationService.js";

export const getPayrollSummary = async (
  month
) => {
  validatePayrollMonth(month);

  const records = await Payroll.find({
    month,
  });

  const summary = {
    month,

    totalPayrolls:
      records.length,

    draft: 0,
    generated: 0,
    paid: 0,

    totalGrossSalary: 0,
    totalDeductions: 0,
    totalNetSalary: 0,
  };

  records.forEach((payroll) => {
    if (
      Object.hasOwn(
        summary,
        payroll.status
      )
    ) {
      summary[payroll.status] += 1;
    }

    summary.totalGrossSalary +=
      payroll.grossSalary;

    summary.totalDeductions +=
      payroll.totalDeductions;

    summary.totalNetSalary +=
      payroll.netSalary;
  });

  summary.totalGrossSalary =
    Number(
      summary.totalGrossSalary.toFixed(2)
    );

  summary.totalDeductions =
    Number(
      summary.totalDeductions.toFixed(2)
    );

  summary.totalNetSalary =
    Number(
      summary.totalNetSalary.toFixed(2)
    );

  return summary;
};
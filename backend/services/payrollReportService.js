import Payroll from "../models/Payroll.js";
import Employee from "../models/Employee.js";

import {
  validateMonth,
} from "./reportValidationService.js";

export const getPayrollReport = async ({
  month,
  employee,
  department,
  status,
} = {}) => {
  validateMonth(month);

  const filter = {};

  if (month) {
    filter.month = month;
  }

  if (employee) {
    filter.employee = employee;
  }

  if (status) {
    filter.status = status;
  }

  if (department) {
    const employees =
      await Employee.find({
        department,
      }).select("_id");

    filter.employee = {
      $in: employees.map(
        (item) => item._id
      ),
    };
  }

  const payrolls = await Payroll.find(
    filter
  )
    .populate({
      path: "employee",
      select:
        "employeeId user department designation",
      populate: [
        {
          path: "user",
          select: "name email",
        },
        {
          path: "department",
          select: "name code",
        },
        {
          path: "designation",
          select: "name code",
        },
      ],
    })
    .sort({ month: -1 });

  const summary = {
    totalPayrolls: payrolls.length,
    draft: 0,
    generated: 0,
    paid: 0,
    grossSalary: 0,
    deductions: 0,
    netSalary: 0,
  };

  payrolls.forEach((payroll) => {
    if (payroll.status === "draft") {
      summary.draft += 1;
    }

    if (payroll.status === "generated") {
      summary.generated += 1;
    }

    if (payroll.status === "paid") {
      summary.paid += 1;
    }

    summary.grossSalary +=
      payroll.grossSalary || 0;

    summary.deductions +=
      payroll.totalDeductions || 0;

    summary.netSalary +=
      payroll.netSalary || 0;
  });

  summary.grossSalary = Number(
    summary.grossSalary.toFixed(2)
  );

  summary.deductions = Number(
    summary.deductions.toFixed(2)
  );

  summary.netSalary = Number(
    summary.netSalary.toFixed(2)
  );

  return {
    summary,
    payrolls,
  };
};
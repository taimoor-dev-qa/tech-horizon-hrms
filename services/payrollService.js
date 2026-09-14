import Employee from "../models/Employee.js";
import Payroll from "../models/Payroll.js";
import SalaryStructure
  from "../models/SalaryStructure.js";

import {
  calculateDailySalary,
  calculatePayroll,
} from "./payrollCalculationService.js";

import {
  getPayrollAttendanceData,
} from "./payrollAttendanceService.js";

import {
  validatePayrollMonth,
} from "./payrollValidationService.js";

export const createPayroll = async (
  data,
  userId
) => {
  validatePayrollMonth(data.month);

  const employee = await Employee.findById(
    data.employee
  ).populate("shift");

  if (!employee) {
    throw new Error("Employee not found");
  }

  const existing = await Payroll.findOne({
    employee: employee._id,
    month: data.month,
  });

  if (existing) {
    throw new Error(
      "Payroll already exists for this employee and month"
    );
  }

  const salary =
    await SalaryStructure.findOne({
      employee: employee._id,
      isActive: true,
    });

  if (!salary) {
    throw new Error(
      "Active salary structure not found"
    );
  }

  const attendance =
    await getPayrollAttendanceData(
      employee,
      data.month
    );

  const dailySalary =
    calculateDailySalary(
      salary.basicSalary,
      attendance.totalWorkingDays
    );

  const absenceUnits =
    attendance.absentDays +
    attendance.halfDays * 0.5;

  const absenceDeduction =
    dailySalary * absenceUnits;

  const unpaidLeaveDeduction =
    dailySalary *
    attendance.unpaidLeaveDays;

  const calculation = calculatePayroll({
    salary,
    overtimeHours:
      data.overtimeHours || 0,
    bonus: data.bonus || 0,
    absenceDeduction,
    unpaidLeaveDeduction,
    otherDeduction:
      data.otherDeduction,
  });

  return Payroll.create({
    employee: employee._id,
    salaryStructure: salary._id,
    month: data.month,

    basicSalary: salary.basicSalary,
    allowances:
      calculation.allowances,

    workingDays:
      attendance.totalWorkingDays,

    absentDays:
      attendance.absentDays,

    halfDays:
      attendance.halfDays,

    unpaidLeaveDays:
      attendance.unpaidLeaveDays,

    overtimeHours:
      Number(data.overtimeHours || 0),

    overtimeAmount:
      calculation.overtimeAmount,

    bonus:
      Number(data.bonus || 0),

    deductions:
      calculation.deductions,

    grossSalary:
      calculation.grossSalary,

    totalDeductions:
      calculation.totalDeductions,

    netSalary:
      calculation.netSalary,

    currency: salary.currency,

    generatedBy: userId,
  });
};
import AppError from "../utils/AppError.js";
import Employee
  from "../models/Employee.js";

import Payroll
  from "../models/Payroll.js";

import {
  PAYROLL_STATUS,
} from "../constants/payroll.js";

import {
  calculateDailySalary,
  calculatePayroll,
} from "./payrollCalculationService.js";

import {
  getPayrollAttendanceData,
} from "./payrollAttendanceService.js";

import {
  getEmployeePayrollPeriod,
} from "./payrollPeriodService.js";

import {
  getSalaryForPayrollMonth,
} from "./salaryStructureService.js";

import {
  validatePayrollMonthPolicy,
} from "./payrollPolicyService.js";
import { mapDuplicateKeyError } from "../utils/mongoDuplicateKey.js";

const payrollExistsError = () =>
  Object.assign(
    new AppError(
      "Payroll already exists for this employee and month",
      400
    ),
    { businessCode: "PAYROLL_EXISTS" }
  );

const draftPayrollError = () =>
  new AppError(
    "Only draft payroll can be recalculated",
    400
  );

const getPayrollEmployee = async (
  employeeId
) => {
  const employee =
    await Employee
      .findById(employeeId)
      .populate("shift");

  if (!employee) {
    throw new AppError(
      "Employee not found",
      400
    );
  }

  return employee;
};

const calculatePayrollSnapshot = async (
  employee,
  data,
  suppliedPolicy = null
) => {
  const policy =
    suppliedPolicy ||
    await validatePayrollMonthPolicy(
      data.month
    );

  const payrollPeriod =
    getEmployeePayrollPeriod(
      employee,
      data.month
    );

  const salary =
    await getSalaryForPayrollMonth(
      employee._id,
      data.month,
      payrollPeriod.periodStart,
      payrollPeriod.periodEnd
    );

  if (!salary) {
    throw new AppError(
      "Salary structure does not cover employee's payable payroll period",
      400
    );
  }

  const attendance =
    await getPayrollAttendanceData(
      employee,
      data.month,
      payrollPeriod
    );

  if (!attendance.totalWorkingDays) {
    throw new AppError(
      "Selected payroll month has no working days",
      400
    );
  }

  if (!attendance.payableWorkingDays) {
    throw new AppError(
      "Employee has no payable working days in selected month",
      400
    );
  }

  const prorationFactor =
    attendance.payableWorkingDays /
    attendance.totalWorkingDays;

  const dailySalary =
    calculateDailySalary(
      salary.basicSalary,
      attendance.totalWorkingDays
    );

  const absenceUnits =
    attendance.absentDays +
    attendance.halfDays * 0.5;

  const absenceDeduction =
    policy.deductAbsence
      ? dailySalary * absenceUnits
      : 0;

  const unpaidLeaveDeduction =
    policy.deductUnpaidLeave
      ? dailySalary *
        attendance.unpaidLeaveDays
      : 0;

  const overtimeHours =
    policy.overtimeEnabled
      ? Number(data.overtimeHours || 0)
      : 0;

  const calculation =
    calculatePayroll({
      salary,
      prorationFactor,
      overtimeHours,
      bonus: data.bonus || 0,
      absenceDeduction,
      unpaidLeaveDeduction,
      otherDeduction:
        data.otherDeduction,
    });

  return {
    employee: employee._id,
    salaryStructure: salary._id,
    month: data.month,
    basicSalary:
      calculation.basicSalary,
    allowances:
      calculation.allowances,
    workingDays:
      attendance.totalWorkingDays,
    payableWorkingDays:
      attendance.payableWorkingDays,
    prorationFactor: Number(
      prorationFactor.toFixed(6)
    ),
    payrollPeriodStart:
      payrollPeriod.periodStart,
    payrollPeriodEnd:
      payrollPeriod.periodEnd,
    absentDays: attendance.absentDays,
    halfDays: attendance.halfDays,
    unpaidLeaveDays:
      attendance.unpaidLeaveDays,
    overtimeHours,
    overtimeAmount:
      calculation.overtimeAmount,
    bonus: Number(data.bonus || 0),
    deductions:
      calculation.deductions,
    grossSalary:
      calculation.grossSalary,
    totalDeductions:
      calculation.totalDeductions,
    netSalary:
      calculation.netSalary,
    currency: policy.currency,
  };
};

export const createPayroll = async (
  data,
  userId
) => {
  const policy =
    await validatePayrollMonthPolicy(
      data.month
    );

  const employee =
    await getPayrollEmployee(
      data.employee
    );

  const existing =
    await Payroll.findOne({
      employee: employee._id,
      month: data.month,
    });

  if (existing) {
    throw payrollExistsError();
  }

  const snapshot =
    await calculatePayrollSnapshot(
      employee,
      data,
      policy
    );

  try {
    return await Payroll.create({
      ...snapshot,
      generatedBy: userId,
    });
  } catch (error) {
    throw mapDuplicateKeyError(
      error,
      [
        {
          fields: ["employee", "month"],
          message: "Payroll already exists for this employee and month",
          businessCode: "PAYROLL_EXISTS",
        },
      ]
    );
  }
};

export const recalculateDraftPayroll =
  async (id, data = {}) => {
    const payroll =
      await Payroll.findById(id);

    if (!payroll) {
      return null;
    }

    if (
      payroll.status !==
      PAYROLL_STATUS.DRAFT
    ) {
      throw draftPayrollError();
    }

    const employeeId =
      payroll.employee?._id ||
      payroll.employee;
    const employee =
      await getPayrollEmployee(
        employeeId
      );

    const snapshot =
      await calculatePayrollSnapshot(
        employee,
        {
          month: payroll.month,
          overtimeHours:
            data.overtimeHours ??
            payroll.overtimeHours,
          bonus:
            data.bonus ??
            payroll.bonus,
          otherDeduction:
            data.otherDeduction ??
            payroll.deductions?.other,
        }
      );

    const updated =
      await Payroll.findOneAndUpdate(
        {
          _id: id,
          status: PAYROLL_STATUS.DRAFT,
        },
        {
          $set: snapshot,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (updated) {
      return updated;
    }

    const current =
      await Payroll.findById(id);

    if (!current) {
      return null;
    }

    throw draftPayrollError();
  };

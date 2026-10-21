import AppError from "../utils/AppError.js";
import Employee
  from "../models/Employee.js";

import Payroll
  from "../models/Payroll.js";

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

export const createPayroll =
  async (
    data,
    userId
  ) => {
    const policy =
      await validatePayrollMonthPolicy(
        data.month
      );

    const employee =
      await Employee
        .findById(
          data.employee
        )
        .populate(
          "shift"
        );

    if (!employee) {
      throw new AppError("Employee not found", 400);
    }

    const existing =
      await Payroll.findOne({
        employee:
          employee._id,

        month:
          data.month,
      });

    if (existing) {
      throw payrollExistsError();
    }

    const payrollPeriod =
      getEmployeePayrollPeriod(
        employee,
        data.month
      );

    const salary =
      await getSalaryForPayrollMonth(
        employee._id,
        data.month,
        payrollPeriod
          .periodStart,
        payrollPeriod
          .periodEnd
      );

    if (!salary) {
      throw new AppError("Salary structure does not cover employee's payable payroll period", 400);
    }

    const attendance =
      await getPayrollAttendanceData(
        employee,
        data.month,
        payrollPeriod
      );

    if (
      !attendance
        .totalWorkingDays
    ) {
      throw new AppError("Selected payroll month has no working days", 400);
    }

    if (
      !attendance
        .payableWorkingDays
    ) {
      throw new AppError("Employee has no payable working days in selected month", 400);
    }

    const prorationFactor =
      attendance
        .payableWorkingDays /
      attendance
        .totalWorkingDays;

    const dailySalary =
      calculateDailySalary(
        salary.basicSalary,
        attendance
          .totalWorkingDays
      );

    const absenceUnits =
      attendance
        .absentDays +
      attendance
        .halfDays *
        0.5;

    const absenceDeduction =
      policy.deductAbsence
        ? dailySalary *
          absenceUnits
        : 0;

    const unpaidLeaveDeduction =
      policy
        .deductUnpaidLeave
        ? dailySalary *
          attendance
            .unpaidLeaveDays
        : 0;

    const overtimeHours =
      policy.overtimeEnabled
        ? Number(
            data
              .overtimeHours ||
              0
          )
        : 0;

    const calculation =
      calculatePayroll({
        salary,

        prorationFactor,

        overtimeHours,

        bonus:
          data.bonus ||
          0,

        absenceDeduction,

        unpaidLeaveDeduction,

        otherDeduction:
          data
            .otherDeduction,
      });

    try {
      return await Payroll.create({
        employee:
          employee._id,

        salaryStructure:
          salary._id,

        month:
          data.month,

        basicSalary:
          calculation
            .basicSalary,

        allowances:
          calculation
            .allowances,

        workingDays:
          attendance
            .totalWorkingDays,

        payableWorkingDays:
          attendance
            .payableWorkingDays,

        prorationFactor:
          Number(
            prorationFactor
              .toFixed(6)
          ),

        payrollPeriodStart:
          payrollPeriod
            .periodStart,

        payrollPeriodEnd:
          payrollPeriod
            .periodEnd,

        absentDays:
          attendance
            .absentDays,

        halfDays:
          attendance
            .halfDays,

        unpaidLeaveDays:
          attendance
            .unpaidLeaveDays,

        overtimeHours,

        overtimeAmount:
          calculation
            .overtimeAmount,

        bonus:
          Number(
            data.bonus ||
            0
          ),

        deductions:
          calculation
            .deductions,

        grossSalary:
          calculation
            .grossSalary,

        totalDeductions:
          calculation
            .totalDeductions,

        netSalary:
          calculation
            .netSalary,

        currency:
          policy.currency,

        generatedBy:
          userId,
      });
    } catch (error) {
      const mapped = mapDuplicateKeyError(
        error,
        [
          {
            fields: ["employee", "month"],
            message: "Payroll already exists for this employee and month",
            businessCode: "PAYROLL_EXISTS",
          },
        ]
      );

      throw mapped;
    }
  };

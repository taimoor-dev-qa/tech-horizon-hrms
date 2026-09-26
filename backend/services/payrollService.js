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
      throw new Error(
        "Employee not found"
      );
    }

    const existing =
      await Payroll.findOne({
        employee:
          employee._id,

        month:
          data.month,
      });

    if (existing) {
      throw new Error(
        "Payroll already exists for this employee and month"
      );
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
      throw new Error(
        "Salary structure does not cover employee's payable payroll period"
      );
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
      throw new Error(
        "Selected payroll month has no working days"
      );
    }

    if (
      !attendance
        .payableWorkingDays
    ) {
      throw new Error(
        "Employee has no payable working days in selected month"
      );
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

    return Payroll.create({
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
  };
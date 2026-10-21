import AppError from "../utils/AppError.js";
import Employee from "../models/Employee.js";

const monthPattern =
  /^\d{4}-(0[1-9]|1[0-2])$/;

export const validatePayrollMonth = (
  month
) => {
  if (!monthPattern.test(month || "")) {
    throw new AppError("Payroll month must use YYYY-MM format", 400);
  }
};

export const getValidEmployee = async (
  employeeId
) => {
  const employee = await Employee.findById(
    employeeId
  );

  if (!employee) {
    throw new AppError("Employee not found", 400);
  }

  return employee;
};

export const validateSalaryDates = (
  effectiveFrom,
  effectiveTo
) => {
  const start = new Date(
    `${effectiveFrom}T00:00:00Z`
  );

  if (Number.isNaN(start.getTime())) {
    throw new AppError("Invalid salary effective date", 400);
  }

  if (!effectiveTo) {
    return;
  }

  const end = new Date(
    `${effectiveTo}T00:00:00Z`
  );

  if (
    Number.isNaN(end.getTime()) ||
    end < start
  ) {
    throw new AppError("Invalid salary effective date range", 400);
  }
};

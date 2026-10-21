import AppError from "../utils/AppError.js";
import {
  EMPLOYEE_STATUS,
} from "../constants/employee.js";

import {
  getHolidayDates,
} from "./holidayQueryService.js";

import {
  getWorkingDates,
} from "./leaveDateService.js";

const toDateString = (
  value
) => {
  return new Date(value)
    .toISOString()
    .slice(0, 10);
};

export const getMonthRange = (
  month
) => {
  const [
    year,
    monthNumber,
  ] =
    month
      .split("-")
      .map(Number);

  const startDate =
    `${year}-${String(
      monthNumber
    ).padStart(
      2,
      "0"
    )}-01`;

  const lastDay =
    new Date(
      Date.UTC(
        year,
        monthNumber,
        0
      )
    )
      .toISOString()
      .slice(0, 10);

  return {
    startDate,
    endDate:
      lastDay,
  };
};

export const getEmployeePayrollPeriod =
  (
    employee,
    month
  ) => {
    const {
      startDate,
      endDate,
    } =
      getMonthRange(
        month
      );

    const joiningDate =
      toDateString(
        employee.joiningDate
      );

    if (
      joiningDate >
      endDate
    ) {
      throw new AppError("Employee had not joined during selected payroll month", 400);
    }

    const endedStatuses = [
      EMPLOYEE_STATUS.RESIGNED,
      EMPLOYEE_STATUS.TERMINATED,
    ];

    if (
      endedStatuses.includes(
        employee.status
      ) &&
      !employee.employmentEndDate
    ) {
      throw new AppError("Employment end date is required before generating payroll for resigned or terminated employee", 400);
    }

    const employmentEndDate =
      employee.employmentEndDate
        ? toDateString(
            employee
              .employmentEndDate
          )
        : null;

    if (
      employmentEndDate &&
      employmentEndDate <
        startDate
    ) {
      throw new AppError("Employee employment ended before selected payroll month", 400);
    }

    const periodStart =
      joiningDate >
      startDate
        ? joiningDate
        : startDate;

    const periodEnd =
      employmentEndDate &&
      employmentEndDate <
        endDate
        ? employmentEndDate
        : endDate;

    if (
      periodStart >
      periodEnd
    ) {
      throw new AppError("Employee has no payable period in selected month", 400);
    }

    return {
      monthStart:
        startDate,

      monthEnd:
        endDate,

      periodStart,

      periodEnd,
    };
  };

export const getMonthlyWorkingDates =
  async (
    month,
    workingDays,
    rangeStart = null,
    rangeEnd = null
  ) => {
    const {
      startDate,
      endDate,
    } =
      getMonthRange(month);

    const actualStart =
      rangeStart &&
      rangeStart >
        startDate
        ? rangeStart
        : startDate;

    const actualEnd =
      rangeEnd &&
      rangeEnd <
        endDate
        ? rangeEnd
        : endDate;

    if (
      actualStart >
      actualEnd
    ) {
      return [];
    }

    const holidays =
      await getHolidayDates(
        actualStart,
        actualEnd
      );

    return getWorkingDates(
      actualStart,
      actualEnd,
      workingDays,
      holidays
    );
  };

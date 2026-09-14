import {
  getHolidayDates,
} from "./holidayQueryService.js";

import {
  getWorkingDates,
} from "./leaveDateService.js";

export const getMonthRange = (month) => {
  const [year, monthNumber] = month
    .split("-")
    .map(Number);

  const startDate =
    `${year}-${String(monthNumber).padStart(2, "0")}-01`;

  const lastDay = new Date(
    Date.UTC(year, monthNumber, 0)
  )
    .toISOString()
    .slice(0, 10);

  return {
    startDate,
    endDate: lastDay,
  };
};

export const getMonthlyWorkingDates = async (
  month,
  workingDays
) => {
  const { startDate, endDate } =
    getMonthRange(month);

  const holidays = await getHolidayDates(
    startDate,
    endDate
  );

  return getWorkingDates(
    startDate,
    endDate,
    workingDays,
    holidays
  );
};
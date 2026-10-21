import AppError from "../utils/AppError.js";
export const validateDateRange = (
  startDate,
  endDate
) => {
  if (!startDate && !endDate) {
    return;
  }

  if (!startDate || !endDate) {
    throw new AppError("Both startDate and endDate are required", 400);
  }

  const start = new Date(
    `${startDate}T00:00:00Z`
  );

  const end = new Date(
    `${endDate}T00:00:00Z`
  );

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    throw new AppError("Invalid date range", 400);
  }

  if (start > end) {
    throw new AppError("startDate cannot be after endDate", 400);
  }
};

export const validateMonth = (month) => {
  if (
    month &&
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)
  ) {
    throw new AppError("Month must use YYYY-MM format", 400);
  }
};

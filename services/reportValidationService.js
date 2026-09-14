export const validateDateRange = (
  startDate,
  endDate
) => {
  if (!startDate && !endDate) {
    return;
  }

  if (!startDate || !endDate) {
    throw new Error(
      "Both startDate and endDate are required"
    );
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
    throw new Error("Invalid date range");
  }

  if (start > end) {
    throw new Error(
      "startDate cannot be after endDate"
    );
  }
};

export const validateMonth = (month) => {
  if (
    month &&
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)
  ) {
    throw new Error(
      "Month must use YYYY-MM format"
    );
  }
};
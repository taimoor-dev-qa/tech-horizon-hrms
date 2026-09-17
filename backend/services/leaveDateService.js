const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const parseDate = (value) => {
  return new Date(`${value}T12:00:00Z`);
};

export const validateLeaveDates = (
  startDate,
  endDate
) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    throw new Error("Invalid leave date");
  }

  if (start > end) {
    throw new Error(
      "Start date cannot be after end date"
    );
  }
};

export const getWorkingDates = (
  startDate,
  endDate,
  workingDays,
  excludedDates = []
) => {
  validateLeaveDates(startDate, endDate);

  const allowedDays = new Set(workingDays);
  const excluded = new Set(excludedDates);

  const current = parseDate(startDate);
  const end = parseDate(endDate);

  const dates = [];

  while (current <= end) {
    const date =
      current.toISOString().slice(0, 10);

    const dayName =
      DAY_NAMES[current.getUTCDay()];

    if (
      allowedDays.has(dayName) &&
      !excluded.has(date)
    ) {
      dates.push(date);
    }

    current.setUTCDate(
      current.getUTCDate() + 1
    );
  }

  return dates;
};

export const calculateWorkingDays = (
  startDate,
  endDate,
  workingDays,
  excludedDates = []
) => {
  return getWorkingDates(
    startDate,
    endDate,
    workingDays,
    excludedDates
  ).length;
};
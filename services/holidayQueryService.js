import Holiday from "../models/Holiday.js";

export const getHolidayDates = async (
  startDate,
  endDate
) => {
  return Holiday.distinct("date", {
    isActive: true,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  });
};
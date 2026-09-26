import Holiday
  from "../models/Holiday.js";

import {
  HOLIDAY_TYPES,
} from "../constants/holiday.js";

const DEFAULT_EXCLUDED_TYPES = [
  HOLIDAY_TYPES.PUBLIC,
  HOLIDAY_TYPES.COMPANY,
];

export const getHolidayDates =
  async (
    startDate,
    endDate,
    {
      includeOptional = false,
    } = {}
  ) => {
    const types =
      includeOptional
        ? Object.values(
            HOLIDAY_TYPES
          )
        : DEFAULT_EXCLUDED_TYPES;

    return Holiday.distinct(
      "date",
      {
        isActive: true,

        type: {
          $in: types,
        },

        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }
    );
  };
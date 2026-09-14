import Holiday from "../models/Holiday.js";

export const createHoliday = async (data) => {
  const existing = await Holiday.findOne({
    name: data.name,
    date: data.date,
  });

  if (existing) {
    throw new Error(
      "Holiday already exists for this date"
    );
  }

  return Holiday.create(data);
};

export const getHolidays = async ({
  year,
} = {}) => {
  const filter = {};

  if (year) {
    filter.date = {
      $gte: `${year}-01-01`,
      $lte: `${year}-12-31`,
    };
  }

  return Holiday.find(filter).sort({
    date: 1,
  });
};

export const updateHoliday = async (
  id,
  data
) => {
  return Holiday.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};

export const deleteHoliday = async (id) => {
  return Holiday.findByIdAndDelete(id);
};
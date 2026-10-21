import AppError from "../utils/AppError.js";
import Holiday from "../models/Holiday.js";
import { mapDuplicateKeyError } from "../utils/mongoDuplicateKey.js";

const duplicateConstraints = [
  { fields: ["name", "date"], message: "Holiday already exists for this date" },
];

export const createHoliday = async (data) => {
  const existing = await Holiday.findOne({
    name: data.name,
    date: data.date,
  });

  if (existing) {
    throw new AppError("Holiday already exists for this date", 400);
  }

  try {
    return await Holiday.create(data);
  } catch (error) {
    throw mapDuplicateKeyError(error, duplicateConstraints);
  }
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
  try {
    return await Holiday.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true,
      }
    );
  } catch (error) {
    throw mapDuplicateKeyError(error, duplicateConstraints);
  }
};

export const deleteHoliday = async (id) => {
  return Holiday.findByIdAndDelete(id);
};

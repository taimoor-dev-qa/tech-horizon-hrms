import Shift from "../models/Shift.js";

export const createShift = async (data) => {
  const existingShift = await Shift.findOne({
    $or: [
      { name: data.name },
      { code: data.code.toUpperCase() },
    ],
  });

  if (existingShift) {
    throw new Error(
      "Shift name or code already exists"
    );
  }

  return Shift.create(data);
};

export const getShifts = async () => {
  return Shift.find().sort({
    startTime: 1,
  });
};

export const getShiftById = async (id) => {
  return Shift.findById(id);
};

export const updateShift = async (
  id,
  data
) => {
  return Shift.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};

export const deleteShift = async (id) => {
  return Shift.findByIdAndDelete(id);
};
import AppError from "../utils/AppError.js";
import Shift from "../models/Shift.js";
import { mapDuplicateKeyError } from "../utils/mongoDuplicateKey.js";
import {
  assertShiftCanBeDeleted,
} from "./resourceReferenceService.js";

const duplicateConstraints = [
  { fields: ["code"], message: "Shift name or code already exists" },
];

export const createShift = async (data) => {
  const existingShift = await Shift.findOne({
    $or: [
      { name: data.name },
      { code: data.code.toUpperCase() },
    ],
  });

  if (existingShift) {
    throw new AppError("Shift name or code already exists", 400);
  }

  try {
    return await Shift.create(data);
  } catch (error) {
    throw mapDuplicateKeyError(error, duplicateConstraints);
  }
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
  try {
    return await Shift.findByIdAndUpdate(
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

export const deleteShift = async (id) => {
  const shift = await Shift.findById(id);

  if (!shift) {
    return null;
  }

  await assertShiftCanBeDeleted(id);

  return Shift.findByIdAndDelete(id);
};

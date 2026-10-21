import AppError from "../utils/AppError.js";
import LeaveType from "../models/LeaveType.js";
import { mapDuplicateKeyError } from "../utils/mongoDuplicateKey.js";

const duplicateConstraints = [
  { fields: ["name"], message: "Leave type name or code already exists" },
  { fields: ["code"], message: "Leave type name or code already exists" },
];

export const createLeaveType = async (
  data
) => {
  const existing = await LeaveType.findOne({
    $or: [
      { name: data.name },
      { code: data.code.toUpperCase() },
    ],
  });

  if (existing) {
    throw new AppError("Leave type name or code already exists", 400);
  }

  try {
    return await LeaveType.create(data);
  } catch (error) {
    throw mapDuplicateKeyError(error, duplicateConstraints);
  }
};

export const getLeaveTypes = async () => {
  return LeaveType.find().sort({
    name: 1,
  });
};

export const updateLeaveType = async (
  id,
  data
) => {
  try {
    return await LeaveType.findByIdAndUpdate(
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

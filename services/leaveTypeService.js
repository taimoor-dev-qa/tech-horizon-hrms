import LeaveType from "../models/LeaveType.js";

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
    throw new Error(
      "Leave type name or code already exists"
    );
  }

  return LeaveType.create(data);
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
  return LeaveType.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};
import Department from "../models/Department.js";
import AppError from "../utils/AppError.js";

export const createDepartment = async (data) => {
  const existingDepartment = await Department.findOne({
    $or: [
      { name: data.name },
      { code: data.code.toUpperCase() },
    ],
  });

  if (existingDepartment) {
    throw new AppError(
      "Department name or code already exists",
      400
    );
  }

  return Department.create(data);
};

export const getDepartments = async () => {
  return Department.find()
    .populate("manager", "name email role")
    .sort({ name: 1 });
};

export const getDepartmentById = async (id) => {
  return Department.findById(id)
    .populate("manager", "name email role");
};

export const updateDepartment = async (id, data) => {
  return Department.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteDepartment = async (id) => {
  return Department.findByIdAndDelete(id);
};
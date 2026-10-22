import AppError from "../utils/AppError.js";
import Department from "../models/Department.js";
import Designation from "../models/Designation.js";
import { mapDuplicateKeyError } from "../utils/mongoDuplicateKey.js";
import {
  assertDesignationCanBeDeleted,
} from "./resourceReferenceService.js";

const duplicateConstraints = [
  { fields: ["code"], message: "Designation name or code already exists" },
  { fields: ["name", "department"], message: "Designation name or code already exists" },
];

const validateDepartment = async (departmentId) => {
  const department = await Department.findById(
    departmentId
  );

  if (!department) {
    throw new AppError("Department not found", 400);
  }

  return department;
};

export const createDesignation = async (data) => {
  await validateDepartment(data.department);

  const existingDesignation =
    await Designation.findOne({
      $or: [
        {
          name: data.name,
          department: data.department,
        },
        {
          code: data.code.toUpperCase(),
        },
      ],
    });

  if (existingDesignation) {
    throw new AppError("Designation name or code already exists", 400);
  }

  try {
    return await Designation.create(data);
  } catch (error) {
    throw mapDuplicateKeyError(error, duplicateConstraints);
  }
};

export const getDesignations = async () => {
  return Designation.find()
    .populate("department", "name code")
    .sort({ name: 1 });
};

export const getDesignationById = async (id) => {
  return Designation.findById(id).populate(
    "department",
    "name code"
  );
};

export const updateDesignation = async (
  id,
  data
) => {
  if (data.department) {
    await validateDepartment(data.department);
  }

  try {
    return await Designation.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true,
      }
    ).populate("department", "name code");
  } catch (error) {
    throw mapDuplicateKeyError(error, duplicateConstraints);
  }
};

export const deleteDesignation = async (id) => {
  const designation =
    await Designation.findById(id);

  if (!designation) {
    return null;
  }

  await assertDesignationCanBeDeleted(id);

  return Designation.findByIdAndDelete(id);
};

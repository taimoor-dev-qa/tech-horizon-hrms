import Department from "../models/Department.js";
import Designation from "../models/Designation.js";

const validateDepartment = async (departmentId) => {
  const department = await Department.findById(
    departmentId
  );

  if (!department) {
    throw new Error("Department not found");
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
    throw new Error(
      "Designation name or code already exists"
    );
  }

  return Designation.create(data);
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

  return Designation.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  ).populate("department", "name code");
};

export const deleteDesignation = async (id) => {
  return Designation.findByIdAndDelete(id);
};
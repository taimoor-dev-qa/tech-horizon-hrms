import AppError from "../utils/AppError.js";
import Department from "../models/Department.js";
import Designation from "../models/Designation.js";

export const validateJobStructure = async (
  departmentId,
  designationId
) => {
  const department = await Department.findById(
    departmentId
  );

  if (!department) {
    throw new AppError("Department not found", 400);
  }

  const designation =
    await Designation.findById(
      designationId
    );

  if (!designation) {
    throw new AppError("Designation not found", 400);
  }

  if (
    String(designation.department) !==
    String(departmentId)
  ) {
    throw new AppError("Designation does not belong to selected department", 400);
  }
};

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
    throw new Error("Department not found");
  }

  const designation =
    await Designation.findById(
      designationId
    );

  if (!designation) {
    throw new Error("Designation not found");
  }

  if (
    String(designation.department) !==
    String(departmentId)
  ) {
    throw new Error(
      "Designation does not belong to selected department"
    );
  }
};
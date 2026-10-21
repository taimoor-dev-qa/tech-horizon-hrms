import AppError from "../utils/AppError.js";
import Employee from "../models/Employee.js";

import {
  DOCUMENT_TYPES,
  DOCUMENT_VISIBILITY,
} from "../constants/document.js";

export const getValidEmployee = async (
  employeeId
) => {
  const employee = await Employee.findById(
    employeeId
  );

  if (!employee) {
    throw new AppError("Employee not found", 400);
  }

  return employee;
};

export const validateDocumentData = (
  data
) => {
  if (
    !Object.values(
      DOCUMENT_TYPES
    ).includes(data.type)
  ) {
    throw new AppError("Invalid document type", 400);
  }

  if (
    data.visibility &&
    !Object.values(
      DOCUMENT_VISIBILITY
    ).includes(data.visibility)
  ) {
    throw new AppError("Invalid document visibility", 400);
  }
};

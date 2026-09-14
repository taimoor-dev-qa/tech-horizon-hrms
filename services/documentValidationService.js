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
    throw new Error(
      "Employee not found"
    );
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
    throw new Error(
      "Invalid document type"
    );
  }

  if (
    data.visibility &&
    !Object.values(
      DOCUMENT_VISIBILITY
    ).includes(data.visibility)
  ) {
    throw new Error(
      "Invalid document visibility"
    );
  }
};
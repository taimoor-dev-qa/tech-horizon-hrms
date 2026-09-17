import Employee from "../models/Employee.js";

import EmployeeDocument
  from "../models/EmployeeDocument.js";

import {
  DOCUMENT_VISIBILITY,
} from "../constants/document.js";

const populateDocument = (query) => {
  return query
    .populate({
      path: "employee",
      select:
        "employeeId user department designation",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate(
      "uploadedBy",
      "name email role"
    );
};

export const getDocuments = async ({
  employee,
  type,
} = {}) => {
  const filter = {
    isActive: true,
  };

  if (employee) {
    filter.employee = employee;
  }

  if (type) {
    filter.type = type;
  }

  return populateDocument(
    EmployeeDocument.find(filter).sort({
      createdAt: -1,
    })
  );
};

export const getMyDocuments = async (
  userId
) => {
  const employee = await Employee.findOne({
    user: userId,
  });

  if (!employee) {
    throw new Error(
      "Employee profile not found"
    );
  }

  return EmployeeDocument.find({
    employee: employee._id,
    isActive: true,
    visibility:
      DOCUMENT_VISIBILITY.EMPLOYEE_VISIBLE,
  }).sort({
    createdAt: -1,
  });
};

export const getDocumentById = async (
  id
) => {
  return populateDocument(
    EmployeeDocument.findById(id)
  );
};
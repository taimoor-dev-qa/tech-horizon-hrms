import fs from "fs/promises";

import Employee from "../models/Employee.js";

import EmployeeDocument
  from "../models/EmployeeDocument.js";

import ROLES from "../constants/roles.js";

import {
  DOCUMENT_VISIBILITY,
} from "../constants/document.js";

const HR_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN,
];

export const getDownloadableDocument =
  async (documentId, user) => {
    const document =
      await EmployeeDocument.findById(
        documentId
      );

    if (!document || !document.isActive) {
      throw new Error(
        "Document not found"
      );
    }

    if (HR_ROLES.includes(user.role)) {
      return document;
    }

    if (
      document.visibility !==
      DOCUMENT_VISIBILITY.EMPLOYEE_VISIBLE
    ) {
      throw new Error(
        "You cannot access this document"
      );
    }

    const employee =
      await Employee.findOne({
        user: user._id,
      });

    if (
      !employee ||
      String(employee._id) !==
        String(document.employee)
    ) {
      throw new Error(
        "You cannot access this document"
      );
    }

    return document;
  };

export const deleteDocument = async (
  id
) => {
  const document =
    await EmployeeDocument.findById(id);

  if (!document) {
    return null;
  }

  await fs
    .unlink(document.filePath)
    .catch(() => {});

  await document.deleteOne();

  return document;
};
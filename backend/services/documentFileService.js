import fs from "fs/promises";

import Employee
  from "../models/Employee.js";

import EmployeeDocument
  from "../models/EmployeeDocument.js";

import ROLES
  from "../constants/roles.js";

import {
  DOCUMENT_VISIBILITY,
} from "../constants/document.js";

import AppError
  from "../utils/AppError.js";

import {
  deleteStoredDocumentFile,
  resolveSafeDocumentPath,
} from "./documentFileSecurityService.js";

import {
  getRuntimeCompanySettings,
} from "./companySettingsRuntimeService.js";

import {
  getCurrentDate,
} from "./attendanceTimeService.js";

const HR_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN,
];

const documentIsExpired =
  async (document) => {
    if (!document.expiresAt) {
      return false;
    }

    const settings =
      await getRuntimeCompanySettings();

    const today =
      getCurrentDate(
        settings.timezone
      );

    return (
      document.expiresAt <
      today
    );
  };

export const getDownloadableDocument =
  async (
    documentId,
    user
  ) => {
    const document =
      await EmployeeDocument.findById(
        documentId
      );

    if (
      !document ||
      !document.isActive
    ) {
      throw new AppError(
        "Document not found",
        404
      );
    }

    /*
     * HR/Super Admin historical
     * expired documents bhi
     * access kar sakte hain.
     */
    if (
      !HR_ROLES.includes(
        user.role
      )
    ) {
      if (
        document.visibility !==
        DOCUMENT_VISIBILITY
          .EMPLOYEE_VISIBLE
      ) {
        throw new AppError(
          "You cannot access this document",
          403
        );
      }

      const employee =
        await Employee.findOne({
          user: user._id,
        });

      if (
        !employee ||
        String(employee._id) !==
          String(
            document.employee
          )
      ) {
        throw new AppError(
          "You cannot access this document",
          403
        );
      }

      if (
        await documentIsExpired(
          document
        )
      ) {
        throw new AppError(
          "Document has expired",
          410
        );
      }
    }

    const absolutePath =
      resolveSafeDocumentPath(
        document.filePath
      );

    try {
      await fs.access(
        absolutePath
      );
    } catch {
      throw new AppError(
        "Stored document file not found",
        404
      );
    }

    return {
      document,
      absolutePath,
    };
  };

export const deleteDocument =
  async (id) => {
    const document =
      await EmployeeDocument.findById(
        id
      );

    if (!document) {
      return null;
    }

    await deleteStoredDocumentFile(
      document.filePath
    );

    await document.deleteOne();

    return document;
  };
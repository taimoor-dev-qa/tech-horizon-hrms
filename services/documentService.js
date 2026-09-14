import fs from "fs/promises";

import EmployeeDocument
  from "../models/EmployeeDocument.js";

import {
  getValidEmployee,
  validateDocumentData,
} from "./documentValidationService.js";

export const createEmployeeDocument =
  async (
    data,
    file,
    uploadedBy
  ) => {
    if (!file) {
      throw new Error(
        "Document file is required"
      );
    }

    try {
      await getValidEmployee(
        data.employee
      );

      validateDocumentData(data);

      return await EmployeeDocument.create({
        employee: data.employee,
        type: data.type,
        title: data.title,
        visibility:
          data.visibility ||
          "employee_visible",
        notes: data.notes || "",
        expiresAt:
          data.expiresAt || null,

        originalName:
          file.originalname,

        storedName:
          file.filename,

        filePath:
          file.path,

        mimeType:
          file.mimetype,

        fileSize:
          file.size,

        uploadedBy,
      });
    } catch (error) {
      await fs.unlink(file.path).catch(
        () => {}
      );

      throw error;
    }
  };

export const updateDocumentDetails =
  async (id, data) => {
    const document =
      await EmployeeDocument.findById(id);

    if (!document) {
      return null;
    }

    const editableFields = [
      "title",
      "type",
      "visibility",
      "notes",
      "expiresAt",
    ];

    const merged = {
      ...document.toObject(),
      ...data,
    };

    validateDocumentData(merged);

    editableFields.forEach((field) => {
      if (
        Object.hasOwn(data, field)
      ) {
        document[field] =
          data[field];
      }
    });

    await document.save();

    return document;
  };
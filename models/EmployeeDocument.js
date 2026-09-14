import mongoose from "mongoose";

import {
  DOCUMENT_TYPES,
  DOCUMENT_VISIBILITY,
} from "../constants/document.js";

const employeeDocumentSchema =
  new mongoose.Schema(
    {
      employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
      },

      type: {
        type: String,
        enum: Object.values(DOCUMENT_TYPES),
        required: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
      },

      originalName: {
        type: String,
        required: true,
      },

      storedName: {
        type: String,
        required: true,
      },

      filePath: {
        type: String,
        required: true,
      },

      mimeType: {
        type: String,
        required: true,
      },

      fileSize: {
        type: Number,
        required: true,
      },

      visibility: {
        type: String,
        enum: Object.values(
          DOCUMENT_VISIBILITY
        ),
        default:
          DOCUMENT_VISIBILITY.EMPLOYEE_VISIBLE,
      },

      notes: {
        type: String,
        trim: true,
        default: "",
      },

      expiresAt: {
        type: String,
        default: null,
      },

      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

employeeDocumentSchema.index({
  employee: 1,
  type: 1,
  createdAt: -1,
});

const EmployeeDocument = mongoose.model(
  "EmployeeDocument",
  employeeDocumentSchema
);

export default EmployeeDocument;
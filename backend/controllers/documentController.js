import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createEmployeeDocument as createService,
  updateDocumentDetails as updateService,
} from "../services/documentService.js";

import {
  getDocumentById as getByIdService,
  getDocuments as getAllService,
  getMyDocuments as getMyService,
} from "../services/documentQueryService.js";

export const uploadDocument = asyncHandler(async (req, res) => {
  const document = await createService(
    req.body,
    req.file,
    req.user._id
  );

  res.status(201).json({
    success: true,
    message:
      "Document uploaded successfully",
    document,
  });
});

export const getDocuments = asyncHandler(async (req, res) => {
  const result =
    await getAllService(
      req.query
    );

  res.status(200).json({
    success: true,

    count:
      result
        .documents
        .length,

    pagination:
      result.pagination,

    documents:
      result.documents,
  });
});

export const getMyDocuments = asyncHandler(async (req, res) => {
  const result =
    await getMyService(
      req.user._id,
      req.query
    );

  res.status(200).json({
    success: true,

    count:
      result
        .documents
        .length,

    pagination:
      result.pagination,

    documents:
      result.documents,
  });
});

export const getDocumentById = asyncHandler(async (req, res) => {
  const document =
    await getByIdService(
      req.params.id
    );

  if (!document) {
    throw new AppError("Document not found", 404);
  }

  res.status(200).json({
    success: true,
    document,
  });
});

export const updateDocument = asyncHandler(async (req, res) => {
  const document =
    await updateService(
      req.params.id,
      req.body
    );

  if (!document) {
    throw new AppError("Document not found", 404);
  }

  res.status(200).json({
    success: true,
    message:
      "Document updated successfully",
    document,
  });
});

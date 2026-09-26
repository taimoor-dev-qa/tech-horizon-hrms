import {
  createEmployeeDocument as createService,
  updateDocumentDetails as updateService,
} from "../services/documentService.js";

import {
  getDocumentById as getByIdService,
  getDocuments as getAllService,
  getMyDocuments as getMyService,
} from "../services/documentQueryService.js";

export const uploadDocument = async (
  req,
  res
) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDocuments =
  async (req, res) => {
    try {
      const result =
        await getDocumentsService(
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
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }
  };

export const getMyDocuments =
  async (
    req,
    res
  ) => {
    try {
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
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }
  };

export const getDocumentById = async (
  req,
  res
) => {
  try {
    const document =
      await getByIdService(
        req.params.id
      );

    if (!document) {
      return res.status(404).json({
        success: false,
        message:
          "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateDocument = async (
  req,
  res
) => {
  try {
    const document =
      await updateService(
        req.params.id,
        req.body
      );

    if (!document) {
      return res.status(404).json({
        success: false,
        message:
          "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Document updated successfully",
      document,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
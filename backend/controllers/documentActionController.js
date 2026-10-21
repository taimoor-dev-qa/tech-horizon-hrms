import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  deleteDocument as deleteService,
  getDownloadableDocument,
} from "../services/documentFileService.js";

export const downloadDocument = asyncHandler(async (req, res) => {
  const { document, absolutePath } = await getDownloadableDocument(
    req.params.id,
    req.user
  );
  return res.download(absolutePath, document.originalName);
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const document = await deleteService(req.params.id);
  if (!document) {
    throw new AppError("Document not found", 404);
  }
  res.status(200).json({
    success: true,
    message: "Document deleted successfully",
  });
});

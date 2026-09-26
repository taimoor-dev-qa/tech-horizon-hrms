
import {
  deleteDocument as deleteService,
  getDownloadableDocument,
} from "../services/documentFileService.js";

export const downloadDocument =
  async (
    req,
    res
  ) => {
    try {
      const {
        document,
        absolutePath,
      } =
        await getDownloadableDocument(
          req.params.id,
          req.user
        );

      return res.download(
        absolutePath,
        document.originalName
      );
    } catch (error) {
      return res.status(
        error.statusCode || 400
      ).json({
        success: false,
        message: error.message,
      });
    }
  };

export const deleteDocument = async (
  req,
  res
) => {
  try {
    const document =
      await deleteService(
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
      message:
        "Document deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
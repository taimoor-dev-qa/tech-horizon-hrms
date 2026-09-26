import multer from "multer";

import {
  validateDocumentMetadata,
} from "../services/documentFileSecurityService.js";

const storage =
  multer.memoryStorage();

const fileFilter = (
  req,
  file,
  callback
) => {
  try {
    validateDocumentMetadata(
      file
    );

    callback(
      null,
      true
    );
  } catch (error) {
    callback(error);
  }
};

const documentUpload =
  multer({
    storage,

    fileFilter,

    limits: {
      fileSize:
        5 * 1024 * 1024,

      files: 1,
    },
  });

export default documentUpload;
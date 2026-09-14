import fs from "fs";
import multer from "multer";
import path from "path";
import crypto from "crypto";

const uploadDirectory = path.resolve(
  "uploads",
  "employee-documents"
);

fs.mkdirSync(uploadDirectory, {
  recursive: true,
});

const storage = multer.diskStorage({
  destination: (
    req,
    file,
    callback
  ) => {
    callback(null, uploadDirectory);
  },

  filename: (
    req,
    file,
    callback
  ) => {
    const extension = path.extname(
      file.originalname
    );

    const safeName = crypto
      .randomBytes(16)
      .toString("hex");

    callback(
      null,
      `${safeName}${extension.toLowerCase()}`
    );
  },
});

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fileFilter = (
  req,
  file,
  callback
) => {
  if (
    !allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    return callback(
      new Error(
        "Only PDF, JPG, PNG, DOC and DOCX files are allowed"
      )
    );
  }

  callback(null, true);
};

const documentUpload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default documentUpload;
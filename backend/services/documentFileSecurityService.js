import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

import AppError
  from "../utils/AppError.js";

export const DOCUMENT_UPLOAD_ROOT =
  path.resolve(
    "uploads",
    "employee-documents"
  );

const FILE_RULES = {
  ".pdf": {
    mimeTypes: [
      "application/pdf",
    ],

    check(buffer) {
      return buffer
        .subarray(0, 5)
        .toString() === "%PDF-";
    },
  },

  ".jpg": {
    mimeTypes: [
      "image/jpeg",
    ],

    check(buffer) {
      return (
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff
      );
    },
  },

  ".jpeg": {
    mimeTypes: [
      "image/jpeg",
    ],

    check(buffer) {
      return (
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff
      );
    },
  },

  ".png": {
    mimeTypes: [
      "image/png",
    ],

    check(buffer) {
      const signature = [
        0x89,
        0x50,
        0x4e,
        0x47,
        0x0d,
        0x0a,
        0x1a,
        0x0a,
      ];

      return signature.every(
        (byte, index) =>
          buffer[index] === byte
      );
    },
  },

  ".doc": {
    mimeTypes: [
      "application/msword",
    ],

    check(buffer) {
      const signature = [
        0xd0,
        0xcf,
        0x11,
        0xe0,
        0xa1,
        0xb1,
        0x1a,
        0xe1,
      ];

      return signature.every(
        (byte, index) =>
          buffer[index] === byte
      );
    },
  },

  ".docx": {
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],

    check(buffer) {
      const zipSignature =
        buffer[0] === 0x50 &&
        buffer[1] === 0x4b &&
        buffer[2] === 0x03 &&
        buffer[3] === 0x04;

      if (!zipSignature) {
        return false;
      }

      const hasContentTypes =
        buffer.includes(
          Buffer.from(
            "[Content_Types].xml"
          )
        );

      const hasWordFolder =
        buffer.includes(
          Buffer.from("word/")
        );

      return (
        hasContentTypes &&
        hasWordFolder
      );
    },
  },
};

export const validateDocumentMetadata =
  (file) => {
    if (!file) {
      throw new AppError(
        "Document file is required",
        400
      );
    }

    const extension =
      path.extname(
        file.originalname || ""
      ).toLowerCase();

    const rule =
      FILE_RULES[extension];

    if (!rule) {
      throw new AppError(
        "Only PDF, JPG, PNG, DOC and DOCX files are allowed",
        400
      );
    }

    if (
      !rule.mimeTypes.includes(
        file.mimetype
      )
    ) {
      throw new AppError(
        "File extension and MIME type do not match",
        400
      );
    }

    return {
      extension,
      rule,
    };
  };

export const validateDocumentFile =
  (file) => {
    const {
      extension,
      rule,
    } =
      validateDocumentMetadata(
        file
      );

    if (
      !file.buffer ||
      !file.buffer.length
    ) {
      throw new AppError(
        "Uploaded document is empty",
        400
      );
    }

    if (!rule.check(file.buffer)) {
      throw new AppError(
        "File content does not match the selected document type",
        400
      );
    }

    return extension;
  };

const sanitizeOriginalName = (
  originalName
) => {
  const name =
    path.basename(
      originalName || "document"
    );

  return name
    .replace(
      /[\u0000-\u001F\u007F]/g,
      ""
    )
    .slice(0, 255);
};

export const saveDocumentFile =
  async (file) => {
    const extension =
      validateDocumentFile(
        file
      );

    await fs.mkdir(
      DOCUMENT_UPLOAD_ROOT,
      {
        recursive: true,
      }
    );

    const storedName =
      `${crypto
        .randomBytes(20)
        .toString("hex")}${extension}`;

    const filePath =
      path.join(
        DOCUMENT_UPLOAD_ROOT,
        storedName
      );

    await fs.writeFile(
      filePath,
      file.buffer,
      {
        flag: "wx",
        mode: 0o600,
      }
    );

    return {
      originalName:
        sanitizeOriginalName(
          file.originalname
        ),

      storedName,
      filePath,
    };
  };

export const resolveSafeDocumentPath =
  (filePath) => {
    const absolutePath =
      path.resolve(filePath);

    const relativePath =
      path.relative(
        DOCUMENT_UPLOAD_ROOT,
        absolutePath
      );

    if (
      relativePath.startsWith(
        ".."
      ) ||
      path.isAbsolute(
        relativePath
      )
    ) {
      throw new AppError(
        "Unsafe document file path",
        400
      );
    }

    return absolutePath;
  };

export const deleteStoredDocumentFile =
  async (filePath) => {
    const absolutePath =
      resolveSafeDocumentPath(
        filePath
      );

    try {
      await fs.unlink(
        absolutePath
      );
    } catch (error) {
      if (
        error.code !== "ENOENT"
      ) {
        throw error;
      }
    }
  };
import { z } from "zod";

import {
  DOCUMENT_TYPES,
  DOCUMENT_VISIBILITY,
} from "../constants/document.js";

import {
  dateString,
  enumValue,
  objectId,
} from "./commonValidators.js";

export const documentUploadSchema =
  z.object({
    employee: objectId,

    type: enumValue(
      Object.values(DOCUMENT_TYPES),
      "Invalid document type"
    ),

    title: z
      .string()
      .trim()
      .min(2)
      .max(200),

    visibility: enumValue(
      Object.values(
        DOCUMENT_VISIBILITY
      ),
      "Invalid document visibility"
    ).optional(),

    notes: z
      .string()
      .trim()
      .max(2000)
      .optional(),

    expiresAt:
      dateString.optional(),
  });

export const updateDocumentSchema =
  documentUploadSchema
    .omit({
      employee: true,
    })
    .partial();
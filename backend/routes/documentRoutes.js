import express from "express";

import {
  getDocumentById,
  getDocuments,
  getMyDocuments,
  updateDocument,
  uploadDocument,
} from "../controllers/documentController.js";

import {
  deleteDocument,
  downloadDocument,
} from "../controllers/documentActionController.js";

import protect
  from "../middleware/authMiddleware.js";

import authorizeRoles
  from "../middleware/roleMiddleware.js";

import documentUpload
  from "../middleware/documentUploadMiddleware.js";

import validateRequest
  from "../middleware/validateRequest.js";

import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

import {
  documentUploadSchema,
  updateDocumentSchema,
} from "../validators/documentValidators.js";

import ROLES
  from "../constants/roles.js";

const router = express.Router();

const hrAccess = authorizeRoles(
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN
);

router.get(
  "/my",
  protect,
  getMyDocuments
);

router.get(
  "/",
  protect,
  hrAccess,
  getDocuments
);

router.post(
  "/",
  protect,
  hrAccess,
  documentUpload.single("file"),
  validateRequest(
    documentUploadSchema
  ),
  uploadDocument
);

router.get(
  "/:id/download",
  protect,
  validateObjectId("id"),
  downloadDocument
);

router.get(
  "/:id",
  protect,
  hrAccess,
  validateObjectId("id"),
  getDocumentById
);

router.put(
  "/:id",
  protect,
  hrAccess,
  validateObjectId("id"),
  validateRequest(
    updateDocumentSchema
  ),
  updateDocument
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN
  ),
  validateObjectId("id"),
  deleteDocument
);

export default router;
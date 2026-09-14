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

import ROLES from "../constants/roles.js";

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
  uploadDocument
);

router.get(
  "/:id/download",
  protect,
  downloadDocument
);

router.get(
  "/:id",
  protect,
  hrAccess,
  getDocumentById
);

router.put(
  "/:id",
  protect,
  hrAccess,
  updateDocument
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN
  ),
  deleteDocument
);

export default router;
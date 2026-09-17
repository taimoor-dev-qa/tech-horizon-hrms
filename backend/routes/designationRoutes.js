import express from "express";

import {
  createDesignation,
  deleteDesignation,
  getDesignationById,
  getDesignations,
  updateDesignation,
} from "../controllers/designationController.js";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import validateRequest from "../middleware/validateRequest.js";

import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

import {
  createDesignationSchema,
  updateDesignationSchema,
} from "../validators/designationValidators.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

// Get all designations
router.get(
  "/",
  protect,
  getDesignations
);

// Get designation by ID
router.get(
  "/:id",
  protect,
  validateObjectId("id"),
  getDesignationById
);

// Create designation
router.post(
  "/",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN
  ),
  validateRequest(
    createDesignationSchema
  ),
  createDesignation
);

// Update designation
router.put(
  "/:id",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN
  ),
  validateObjectId("id"),
  validateRequest(
    updateDesignationSchema
  ),
  updateDesignation
);

// Delete designation
router.delete(
  "/:id",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN
  ),
  validateObjectId("id"),
  deleteDesignation
);

export default router;

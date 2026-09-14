import express from "express";

import {
  createDesignation,
  deleteDesignation,
  getDesignationById,
  getDesignations,
  updateDesignation,
} from "../controllers/designationController.js";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles
  from "../middleware/roleMiddleware.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

router.get(
  "/",
  protect,
  getDesignations
);

router.get(
  "/:id",
  protect,
  getDesignationById
);

router.post(
  "/",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN
  ),
  createDesignation
);

router.put(
  "/:id",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN
  ),
  updateDesignation
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(ROLES.SUPER_ADMIN),
  deleteDesignation
);

export default router;
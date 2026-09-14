import express from "express";

import validateRequest
  from "../middleware/validateRequest.js";

import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

import {
  departmentSchema,
  updateDepartmentSchema,
} from "../validators/departmentValidators.js";

import {
  createDepartment,
  deleteDepartment,
  getDepartmentById,
  getDepartments,
  updateDepartment,
} from "../controllers/departmentController.js";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles
  from "../middleware/roleMiddleware.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

router.post(
  "/",
  protect,
  hrAccess,
  validateRequest(
    departmentSchema
  ),
  createDepartment
);

router.put(
  "/:id",
  protect,
  hrAccess,
  validateObjectId("id"),
  validateRequest(
    updateDepartmentSchema
  ),
  updateDepartment
);

router.get(
  "/",
  validateObjectId("id"),
  protect,
  validateRequest(
    getDepartmentsSchema
  ),
  getDepartments
);

router.get(
  "/:id",
  protect,
  getDepartmentById
);

router.post(
  "/",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN
  ),
  createDepartment
);

router.put(
  "/:id",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN
  ),
  updateDepartment
);

router.delete(
  "/:id",
  protect,
  validateObjectId("id"),
  authorizeRoles(ROLES.SUPER_ADMIN),
  deleteDepartment
);

export default router;
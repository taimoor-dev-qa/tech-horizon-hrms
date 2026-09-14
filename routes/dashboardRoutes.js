import express from "express";

import {
  adminDashboard,
  employeeDashboard,
} from "../controllers/dashboardController.js";

import protect
  from "../middleware/authMiddleware.js";

import authorizeRoles
  from "../middleware/roleMiddleware.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

router.get(
  "/admin",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN
  ),
  adminDashboard
);

router.get(
  "/employee",
  protect,
  employeeDashboard
);

export default router;
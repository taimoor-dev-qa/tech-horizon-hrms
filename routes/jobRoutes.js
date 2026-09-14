import express from "express";

import validateRequest
  from "../middleware/validateRequest.js";

import {
  jobSchema,
} from "../validators/recruitmentValidators.js";


import {
  createJob,
  deleteJob,
  getJobById,
  getJobs,
  updateJob,
} from "../controllers/jobController.js";

import protect
  from "../middleware/authMiddleware.js";

import authorizeRoles
  from "../middleware/roleMiddleware.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

const recruitmentAccess = authorizeRoles(
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN
);

router.post(
  "/",
  protect,
  recruitmentAccess,
  validateRequest(jobSchema),
  createJob
);

router.get(
  "/",
  protect,
  getJobs
);

router.post(
  "/",
  protect,
  recruitmentAccess,
  createJob
);

router.get(
  "/:id",
  protect,
  getJobById
);

router.put(
  "/:id",
  protect,
  recruitmentAccess,
  updateJob
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(ROLES.SUPER_ADMIN),
  deleteJob
);

export default router;
import express from "express";

import {
  createJob,
  deleteJob,
  getJobById,
  getJobs,
  updateJob,
} from "../controllers/jobController.js";

import ROLES from "../constants/roles.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

import {
  jobSchema,
  updateJobSchema,
} from "../validators/recruitmentValidators.js";

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

router.get(
  "/:id",
  protect,
  validateObjectId("id"),
  getJobById
);

router.put(
  "/:id",
  protect,
  recruitmentAccess,
  validateObjectId("id"),
  validateRequest(updateJobSchema),
  updateJob
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(ROLES.SUPER_ADMIN),
  validateObjectId("id"),
  deleteJob
);

export default router;

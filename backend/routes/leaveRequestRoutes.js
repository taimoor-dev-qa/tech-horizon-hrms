import express from "express";

import {
  applyLeave,
  getMyLeaves,
} from "../controllers/leaveRequestController.js";

import validateRequest
  from "../middleware/validateRequest.js";

import {
  createLeaveRequestSchema,
} from "../validators/leaveValidators.js";

import protect
  from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  validateRequest(
    createLeaveRequestSchema
  ),
  applyLeave
);

router.get(
  "/me",
  protect,
  getMyLeaves
);

export default router;

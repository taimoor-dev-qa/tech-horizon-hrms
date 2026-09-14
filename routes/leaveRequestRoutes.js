import express from "express";

import {
  applyLeave,
  getMyLeaves,
} from "../controllers/leaveRequestController.js";

import validateRequest
  from "../middleware/validateRequest.js";

import {
  leaveRequestSchema,
} from "../validators/leaveValidators.js";

import protect
  from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  validateRequest(
    leaveRequestSchema
  ),
  applyLeave
);

router.post(
  "/",
  protect,
  applyLeave
);

router.get(
  "/me",
  protect,
  getMyLeaves
);

export default router;
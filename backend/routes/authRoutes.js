import express from "express";

import {
  getMyProfile,
  loginUser,
  registerUser,
} from "../controllers/authController.js";

import protect
  from "../middleware/authMiddleware.js";

import validateRequest
  from "../middleware/validateRequest.js";

import {
  loginSchema,
  registerSchema,
} from "../validators/authValidators.js";

const router = express.Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  registerUser
);

router.post(
  "/login",
  validateRequest(loginSchema),
  loginUser
);

router.get(
  "/me",
  protect,
  getMyProfile
);

export default router;
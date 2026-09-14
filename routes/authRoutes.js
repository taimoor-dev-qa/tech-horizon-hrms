import express from "express";
import {
  registerUser,
  loginUser,
  getMyProfile,
} from "../controllers/authController.js";

import validateRequest
  from "../middleware/validateRequest.js";

import {
  loginSchema,
  registerSchema,
} from "../validators/authValidators.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/me", protect, getMyProfile);

router.post("/register",validateRequest(registerSchema),registerUser);

router.post("/login",validateRequest(loginSchema),loginUser);

router.get( "/me",protect,getMyProfile);

export default router;
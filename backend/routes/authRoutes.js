import express from "express";

import {
  changeOwnPassword,
  getMyProfile,
  loginUser,
} from "../controllers/authController.js";

import protect
  from "../middleware/authMiddleware.js";

import validateRequest
  from "../middleware/validateRequest.js";

import {
  loginSchema,
} from "../validators/authValidators.js";
import {
  changePasswordSchema,
} from "../validators/passwordValidators.js";

const router = express.Router();

router.post("/register", (req, res) => {
  res.status(410).json({
    success: false,
    message: "Public registration is no longer available",
  });
});

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

router.patch(
  "/change-password",
  protect,
  validateRequest(changePasswordSchema),
  changeOwnPassword
);

export default router;

import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { changeOwnPassword as changePasswordService } from "../services/passwordService.js";

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("Your account is inactive", 403);
  }

  const passwordMatched = await user.comparePassword(password);

  if (!passwordMatched) {
    throw new AppError("Invalid email or password", 401);
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(
    user._id,
    user.tokenVersion || 0
  );

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword:
        Boolean(user.mustChangePassword),
    },
  });
});

export const getMyProfile = asyncHandler(async (req, res) => {
  const user = req.user.toObject
    ? req.user.toObject()
    : { ...req.user };

  delete user.password;
  delete user.tokenVersion;
  delete user.accountGuardVersion;

  res.status(200).json({
    success: true,
    user,
  });
});

export const changeOwnPassword = asyncHandler(async (req, res) => {
  const user = await changePasswordService(
    req.user._id,
    req.body.currentPassword,
    req.body.newPassword
  );

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
    user,
  });
});

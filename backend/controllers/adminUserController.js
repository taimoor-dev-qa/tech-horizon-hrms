import asyncHandler from "../utils/asyncHandler.js";
import {
  createPrivilegedUser as createUser,
  changePrivilegedUserRole as changeUserRole,
  deactivatePrivilegedUser as deactivateUser,
  reactivatePrivilegedUser as reactivateUser,
  resetPrivilegedUserPassword as resetUserPassword,
} from "../services/adminUserService.js";
import AppError from "../utils/AppError.js";

const sendUserResult = (
  res,
  user,
  message
) => {
  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    message,
    user,
  });
};

export const createPrivilegedUser = asyncHandler(async (req, res) => {
  const user = await createUser(req.body);
  res.status(201).json({
    success: true,
    message: "Privileged user created successfully",
    user,
  });
});

export const deactivatePrivilegedUser = asyncHandler(async (req, res) => {
  const user = await deactivateUser(
    req.params.id,
    req.user._id
  );
  sendUserResult(
    res,
    user,
    "Privileged user deactivated successfully"
  );
});

export const reactivatePrivilegedUser = asyncHandler(async (req, res) => {
  const user = await reactivateUser(
    req.params.id,
    req.user._id
  );
  sendUserResult(
    res,
    user,
    "Privileged user reactivated successfully"
  );
});

export const resetPrivilegedUserPassword = asyncHandler(async (req, res) => {
  const user = await resetUserPassword(
    req.params.id,
    req.user._id,
    req.body.newPassword
  );
  sendUserResult(
    res,
    user,
    "Privileged user password reset; password change is required at next login"
  );
});

export const changePrivilegedUserRole = asyncHandler(async (req, res) => {
  const user = await changeUserRole(
    req.params.id,
    req.user._id,
    req.body.role
  );
  sendUserResult(
    res,
    user,
    "Privileged user role updated successfully"
  );
});

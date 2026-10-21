import asyncHandler from "../utils/asyncHandler.js";
import {
  createPrivilegedUser as createUser,
} from "../services/adminUserService.js";

export const createPrivilegedUser = asyncHandler(async (req, res) => {
  const user = await createUser(req.body);
  res.status(201).json({
    success: true,
    message: "Privileged user created successfully",
    user,
  });
});

import mongoose from "mongoose";
import User from "../models/User.js";
import ROLES from "../constants/roles.js";
import AppError from "../utils/AppError.js";
import {
  adminAccountSchema,
} from "../validators/adminUserValidators.js";

// MongoDB enforces a unique _id index. This ID is reserved for bootstrap only.
export const BOOTSTRAP_ADMIN_ID = new mongoose.Types.ObjectId(
  "000000000000000000000001"
);

export const bootstrapSuperAdmin = async (input, UserModel = User) => {
  const result = adminAccountSchema.safeParse(input);
  if (!result.success) {
    throw new AppError("Invalid bootstrap account details", 400);
  }

  if (await UserModel.exists({})) {
    throw new AppError("Bootstrap requires an empty user collection", 409);
  }

  try {
    await UserModel.create({
      _id: BOOTSTRAP_ADMIN_ID,
      ...result.data,
      role: ROLES.SUPER_ADMIN,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("Bootstrap has already been claimed", 409);
    }
    throw error;
  }
};

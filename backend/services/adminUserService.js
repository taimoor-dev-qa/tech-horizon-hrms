import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import {
  PRIVILEGED_ROLES,
} from "../validators/adminUserValidators.js";

export const createPrivilegedUser = async (data, UserModel = User) => {
  if (!PRIVILEGED_ROLES.includes(data.role)) {
    throw new AppError("Invalid privileged role", 400);
  }

  if (await UserModel.exists({ email: data.email })) {
    throw new AppError("Email already exists", 409);
  }

  try {
    const user = await UserModel.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    });

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("Email already exists", 409);
    }
    throw error;
  }
};

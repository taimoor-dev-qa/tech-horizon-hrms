import AppError from "../utils/AppError.js";
import User from "../models/User.js";

const publicUserFields = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  mustChangePassword:
    Boolean(user.mustChangePassword),
});

export const changeOwnPassword = async (
  userId,
  currentPassword,
  newPassword
) => {
  const user = await User.findById(userId)
    .select("+password");

  if (!user) {
    throw new AppError(
      "User account not found",
      404
    );
  }

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError(
      "Current password is incorrect",
      400
    );
  }

  if (newPassword === currentPassword) {
    throw new AppError(
      "New password must be different from current password",
      400
    );
  }

  user.password = newPassword;
  user.mustChangePassword = false;
  await user.save();

  return publicUserFields(user);
};

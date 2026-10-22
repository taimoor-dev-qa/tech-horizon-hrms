import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import {
  PRIVILEGED_ROLES,
} from "../validators/adminUserValidators.js";
import ROLES from "../constants/roles.js";
import runTransaction from "../utils/runTransaction.js";

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: Boolean(user.isActive),
  mustChangePassword:
    Boolean(user.mustChangePassword),
});

const getPrivilegedTarget = async (
  id,
  session
) => {
  const user = await User.findById(id)
    .session(session);

  if (!user) {
    return null;
  }

  if (!PRIVILEGED_ROLES.includes(user.role)) {
    throw new AppError(
      "Account is not a managed privileged account",
      400
    );
  }

  return user;
};

const assertNotSelf = (target, actorId) => {
  if (String(target._id) === String(actorId)) {
    throw new AppError(
      "You cannot perform this action on your own account",
      400
    );
  }
};

const acquireSuperAdminGuard = async (session) => {
  const firstActiveAdmin = await User.findOne({
    role: ROLES.SUPER_ADMIN,
    isActive: true,
  })
    .sort({ _id: 1 })
    .session(session);

  if (!firstActiveAdmin) {
    throw new AppError(
      "At least one active Super Admin must remain",
      400
    );
  }

  const locked = await User.findOneAndUpdate(
    {
      _id: firstActiveAdmin._id,
      role: ROLES.SUPER_ADMIN,
      isActive: true,
    },
    {
      $inc: {
        accountGuardVersion: 1,
      },
    },
    {
      new: true,
      session,
    }
  );

  if (!locked) {
    throw new AppError(
      "Super Admin accounts changed; retry the request",
      409
    );
  }
};

const assertAnotherActiveSuperAdmin = async (
  session
) => {
  const count = await User.countDocuments({
    role: ROLES.SUPER_ADMIN,
    isActive: true,
  }).session(session);

  if (count < 2) {
    throw new AppError(
      "The last active Super Admin cannot be deactivated or demoted",
      400
    );
  }
};

export const protectLastActiveSuperAdmin = async (
  session
) => {
  await acquireSuperAdminGuard(session);
  await assertAnotherActiveSuperAdmin(session);
};

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

export const deactivatePrivilegedUser = async (
  id,
  actorId
) => runTransaction(async (session) => {
  const user = await getPrivilegedTarget(id, session);
  if (!user) return null;
  assertNotSelf(user, actorId);

  if (
    user.role === ROLES.SUPER_ADMIN &&
    user.isActive
  ) {
    await protectLastActiveSuperAdmin(session);
  }

  user.isActive = false;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save({ session });
  return safeUser(user);
});

export const reactivatePrivilegedUser = async (
  id,
  actorId
) => runTransaction(async (session) => {
  const user = await getPrivilegedTarget(id, session);
  if (!user) return null;
  assertNotSelf(user, actorId);

  user.isActive = true;
  await user.save({ session });
  return safeUser(user);
});

export const resetPrivilegedUserPassword = async (
  id,
  actorId,
  newPassword
) => runTransaction(async (session) => {
  const user = await getPrivilegedTarget(id, session);
  if (!user) return null;
  assertNotSelf(user, actorId);

  user.password = newPassword;
  user.mustChangePassword = true;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save({ session });
  return safeUser(user);
});

export const changePrivilegedUserRole = async (
  id,
  actorId,
  role
) => runTransaction(async (session) => {
  if (!PRIVILEGED_ROLES.includes(role)) {
    throw new AppError(
      "Invalid privileged role",
      400
    );
  }

  const user = await getPrivilegedTarget(id, session);
  if (!user) return null;
  assertNotSelf(user, actorId);

  if (
    user.role === ROLES.SUPER_ADMIN &&
    role !== ROLES.SUPER_ADMIN &&
    user.isActive
  ) {
    await protectLastActiveSuperAdmin(session);
  }

  if (user.role !== role) {
    user.role = role;
    user.tokenVersion =
      (user.tokenVersion || 0) + 1;
  }
  await user.save({ session });
  return safeUser(user);
});

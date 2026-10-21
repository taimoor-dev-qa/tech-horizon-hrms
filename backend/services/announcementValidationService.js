import Department from "../models/Department.js";
import Team from "../models/Team.js";

import ROLES from "../constants/roles.js";

import {
  ANNOUNCEMENT_AUDIENCE,
} from "../constants/announcement.js";

import AppError from "../utils/AppError.js";

export const validateAnnouncementTarget =
  async (data) => {
    if (
      data.audience ===
      ANNOUNCEMENT_AUDIENCE.DEPARTMENT
    ) {
      if (!data.department) {
        throw new AppError(
          "Department is required",
          400
        );
      }

      const department =
        await Department.findById(
          data.department
        );

      if (!department) {
        throw new AppError(
          "Department not found",
          400
        );
      }
    }

    if (
      data.audience ===
      ANNOUNCEMENT_AUDIENCE.TEAM
    ) {
      if (!data.team) {
        throw new AppError(
          "Team is required",
          400
        );
      }

      const team = await Team.findById(
        data.team
      );

      if (!team) {
        throw new AppError("Team not found", 400);
      }
    }

    if (
      data.audience ===
      ANNOUNCEMENT_AUDIENCE.ROLES
    ) {
      if (
        !Array.isArray(data.roles) ||
        !data.roles.length
      ) {
        throw new AppError(
          "At least one role is required",
          400
        );
      }

      const validRoles =
        Object.values(ROLES);

      const invalidRole = data.roles.find(
        (role) =>
          !validRoles.includes(role)
      );

      if (invalidRole) {
        throw new AppError(
          `Invalid role: ${invalidRole}`,
          400
        );
      }
    }
  };

export const validateExpiry = (
  expiresAt
) => {
  if (!expiresAt) {
    return;
  }

  const expiry = new Date(expiresAt);

  if (
    Number.isNaN(expiry.getTime()) ||
    expiry <= new Date()
  ) {
    throw new AppError(
      "Expiry date must be in the future",
      400
    );
  }
};

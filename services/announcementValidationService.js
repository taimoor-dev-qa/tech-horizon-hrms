import Department from "../models/Department.js";
import Team from "../models/Team.js";

import ROLES from "../constants/roles.js";

import {
  ANNOUNCEMENT_AUDIENCE,
} from "../constants/announcement.js";

export const validateAnnouncementTarget =
  async (data) => {
    if (
      data.audience ===
      ANNOUNCEMENT_AUDIENCE.DEPARTMENT
    ) {
      if (!data.department) {
        throw new Error(
          "Department is required"
        );
      }

      const department =
        await Department.findById(
          data.department
        );

      if (!department) {
        throw new Error(
          "Department not found"
        );
      }
    }

    if (
      data.audience ===
      ANNOUNCEMENT_AUDIENCE.TEAM
    ) {
      if (!data.team) {
        throw new Error(
          "Team is required"
        );
      }

      const team = await Team.findById(
        data.team
      );

      if (!team) {
        throw new Error("Team not found");
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
        throw new Error(
          "At least one role is required"
        );
      }

      const validRoles =
        Object.values(ROLES);

      const invalidRole = data.roles.find(
        (role) =>
          !validRoles.includes(role)
      );

      if (invalidRole) {
        throw new Error(
          `Invalid role: ${invalidRole}`
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
    throw new Error(
      "Expiry date must be in the future"
    );
  }
};
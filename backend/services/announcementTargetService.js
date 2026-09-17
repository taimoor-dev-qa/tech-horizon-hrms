import Employee from "../models/Employee.js";
import User from "../models/User.js";

import {
  ANNOUNCEMENT_AUDIENCE,
} from "../constants/announcement.js";

export const getAnnouncementRecipients =
  async (announcement) => {
    if (
      announcement.audience ===
      ANNOUNCEMENT_AUDIENCE.ALL
    ) {
      const users = await User.find({
        isActive: true,
      }).select("_id");

      return users.map(
        (user) => user._id
      );
    }

    if (
      announcement.audience ===
      ANNOUNCEMENT_AUDIENCE.ROLES
    ) {
      const users = await User.find({
        role: {
          $in: announcement.roles,
        },
        isActive: true,
      }).select("_id");

      return users.map(
        (user) => user._id
      );
    }

    const employeeFilter = {};

    if (
      announcement.audience ===
      ANNOUNCEMENT_AUDIENCE.DEPARTMENT
    ) {
      employeeFilter.department =
        announcement.department;
    }

    if (
      announcement.audience ===
      ANNOUNCEMENT_AUDIENCE.TEAM
    ) {
      employeeFilter.team =
        announcement.team;
    }

    const employees = await Employee.find(
      employeeFilter
    )
      .populate({
        path: "user",
        match: { isActive: true },
        select: "_id",
      });

    return employees
      .filter((employee) => employee.user)
      .map(
        (employee) =>
          employee.user._id
      );
  };
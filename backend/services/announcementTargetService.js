import Employee
  from "../models/Employee.js";

import User
  from "../models/User.js";

import {
  ANNOUNCEMENT_AUDIENCE,
} from "../constants/announcement.js";

export const getAnnouncementRecipients =
  async (
    announcement,
    session = null
  ) => {
    if (
      announcement.audience ===
      ANNOUNCEMENT_AUDIENCE.ALL
    ) {
      let query =
        User.find({
          isActive: true,
        }).select("_id");

      if (session) {
        query =
          query.session(session);
      }

      const users =
        await query;

      return users.map(
        (user) => user._id
      );
    }

    if (
      announcement.audience ===
      ANNOUNCEMENT_AUDIENCE.ROLES
    ) {
      let query =
        User.find({
          role: {
            $in:
              announcement.roles,
          },

          isActive: true,
        }).select("_id");

      if (session) {
        query =
          query.session(session);
      }

      const users =
        await query;

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

    let query =
      Employee.find(
        employeeFilter
      )
        .populate({
          path: "user",

          match: {
            isActive: true,
          },

          select: "_id",

          options:
            session
              ? { session }
              : {},
        });

    if (session) {
      query =
        query.session(session);
    }

    const employees =
      await query;

    return employees
      .filter(
        (employee) =>
          employee.user
      )
      .map(
        (employee) =>
          employee.user._id
      );
  };
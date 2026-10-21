import AppError from "../utils/AppError.js";
import Department
  from "../models/Department.js";

import Designation
  from "../models/Designation.js";

import Team
  from "../models/Team.js";

import User
  from "../models/User.js";

import Shift
  from "../models/Shift.js";

const withSession = (
  query,
  session
) => {
  return session
    ? query.session(session)
    : query;
};

export const validateOrganization =
  async (
    {
      department,
      designation,
      team,
    },
    session = null
  ) => {
    const departmentRecord =
      await withSession(
        Department.findById(
          department
        ),
        session
      );

    if (!departmentRecord) {
      throw new AppError("Department not found", 400);
    }

    const designationRecord =
      await withSession(
        Designation.findById(
          designation
        ),
        session
      );

    if (!designationRecord) {
      throw new AppError("Designation not found", 400);
    }

    if (
      String(
        designationRecord.department
      ) !== String(department)
    ) {
      throw new AppError("Designation does not belong to selected department", 400);
    }

    if (team) {
      const teamRecord =
        await withSession(
          Team.findById(team),
          session
        );

      if (!teamRecord) {
        throw new AppError("Team not found", 400);
      }

      if (
        String(
          teamRecord.department
        ) !== String(department)
      ) {
        throw new AppError("Team does not belong to selected department", 400);
      }
    }
  };

export const validateManager =
  async (
    managerId,
    session = null
  ) => {
    if (!managerId) {
      return;
    }

    const manager =
      await withSession(
        User.findById(managerId),
        session
      );

    if (!manager) {
      throw new AppError("Manager not found", 400);
    }

    if (
      manager.role !== "manager"
    ) {
      throw new AppError("Selected user does not have manager role", 400);
    }
  };

export const validateTeamLead =
  async (
    teamLeadId,
    session = null
  ) => {
    if (!teamLeadId) {
      return;
    }

    const teamLead =
      await withSession(
        User.findById(
          teamLeadId
        ),
        session
      );

    if (!teamLead) {
      throw new AppError("Team lead not found", 400);
    }

    if (
      teamLead.role !==
      "team_lead"
    ) {
      throw new AppError("Selected user does not have team lead role", 400);
    }
  };

export const validateShift =
  async (
    shiftId,
    session = null
  ) => {
    if (!shiftId) {
      return;
    }

    const shift =
      await withSession(
        Shift.findById(shiftId),
        session
      );

    if (!shift) {
      throw new AppError("Shift not found", 400);
    }

    if (!shift.isActive) {
      throw new AppError("Selected shift is inactive", 400);
    }
  };

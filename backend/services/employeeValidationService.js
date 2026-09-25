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
      throw new Error(
        "Department not found"
      );
    }

    const designationRecord =
      await withSession(
        Designation.findById(
          designation
        ),
        session
      );

    if (!designationRecord) {
      throw new Error(
        "Designation not found"
      );
    }

    if (
      String(
        designationRecord.department
      ) !== String(department)
    ) {
      throw new Error(
        "Designation does not belong to selected department"
      );
    }

    if (team) {
      const teamRecord =
        await withSession(
          Team.findById(team),
          session
        );

      if (!teamRecord) {
        throw new Error(
          "Team not found"
        );
      }

      if (
        String(
          teamRecord.department
        ) !== String(department)
      ) {
        throw new Error(
          "Team does not belong to selected department"
        );
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
      throw new Error(
        "Manager not found"
      );
    }

    if (
      manager.role !== "manager"
    ) {
      throw new Error(
        "Selected user does not have manager role"
      );
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
      throw new Error(
        "Team lead not found"
      );
    }

    if (
      teamLead.role !==
      "team_lead"
    ) {
      throw new Error(
        "Selected user does not have team lead role"
      );
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
      throw new Error(
        "Shift not found"
      );
    }

    if (!shift.isActive) {
      throw new Error(
        "Selected shift is inactive"
      );
    }
  };
import Department from "../models/Department.js";
import Designation from "../models/Designation.js";
import Team from "../models/Team.js";
import User from "../models/User.js";
import Shift from "../models/Shift.js";

export const validateOrganization = async ({
  department,
  designation,
  team,
}) => {
  const departmentRecord =
    await Department.findById(department);

  if (!departmentRecord) {
    throw new Error("Department not found");
  }

  const designationRecord =
    await Designation.findById(designation);

  if (!designationRecord) {
    throw new Error("Designation not found");
  }

  if (
    String(designationRecord.department) !==
    String(department)
  ) {
    throw new Error(
      "Designation does not belong to selected department"
    );
  }

  if (team) {
    const teamRecord = await Team.findById(team);

    if (!teamRecord) {
      throw new Error("Team not found");
    }

    if (
      String(teamRecord.department) !==
      String(department)
    ) {
      throw new Error(
        "Team does not belong to selected department"
      );
    }
  }
};

export const validateManager = async (managerId) => {
  if (!managerId) {
    return;
  }

  const manager = await User.findById(managerId);

  if (!manager) {
    throw new Error("Manager not found");
  }

  if (manager.role !== "manager") {
    throw new Error(
      "Selected user does not have manager role"
    );
  }
};

export const validateTeamLead = async (teamLeadId) => {
  if (!teamLeadId) {
    return;
  }

  const teamLead = await User.findById(teamLeadId);

  if (!teamLead) {
    throw new Error("Team lead not found");
  }

  if (teamLead.role !== "team_lead") {
    throw new Error(
      "Selected user does not have team lead role"
    );
  }
};

export const validateShift = async (shiftId) => {
  if (!shiftId) {
    return;
  }

  const shift = await Shift.findById(shiftId);

  if (!shift) {
    throw new Error("Shift not found");
  }

  if (!shift.isActive) {
    throw new Error("Selected shift is inactive");
  }
};
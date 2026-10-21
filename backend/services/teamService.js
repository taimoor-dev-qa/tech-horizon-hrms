import AppError from "../utils/AppError.js";
import Department from "../models/Department.js";
import Team from "../models/Team.js";
import User from "../models/User.js";
import { mapDuplicateKeyError } from "../utils/mongoDuplicateKey.js";

const duplicateConstraints = [
  { fields: ["code"], message: "Team name or code already exists" },
  { fields: ["name", "department"], message: "Team name or code already exists" },
];

const validateDepartment = async (departmentId) => {
  const department = await Department.findById(
    departmentId
  );

  if (!department) {
    throw new AppError("Department not found", 400);
  }

  return department;
};

const validateTeamLead = async (teamLeadId) => {
  if (!teamLeadId) {
    return null;
  }

  const user = await User.findById(teamLeadId);

  if (!user) {
    throw new AppError("Team lead user not found", 400);
  }

  if (
    !["team_lead", "manager"].includes(user.role)
  ) {
    throw new AppError("Selected user must be a team lead or manager", 400);
  }

  return user;
};

export const createTeam = async (data) => {
  await validateDepartment(data.department);
  await validateTeamLead(data.teamLead);

  const existingTeam = await Team.findOne({
    $or: [
      {
        name: data.name,
        department: data.department,
      },
      {
        code: data.code.toUpperCase(),
      },
    ],
  });

  if (existingTeam) {
    throw new AppError("Team name or code already exists", 400);
  }

  try {
    return await Team.create(data);
  } catch (error) {
    throw mapDuplicateKeyError(error, duplicateConstraints);
  }
};

export const getTeams = async () => {
  return Team.find()
    .populate("department", "name code")
    .populate("teamLead", "name email role")
    .sort({ name: 1 });
};

export const getTeamById = async (id) => {
  return Team.findById(id)
    .populate("department", "name code")
    .populate("teamLead", "name email role");
};

export const updateTeam = async (id, data) => {
  if (data.department) {
    await validateDepartment(data.department);
  }

  if (data.teamLead) {
    await validateTeamLead(data.teamLead);
  }

  try {
    return await Team.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("department", "name code")
      .populate("teamLead", "name email role");
  } catch (error) {
    throw mapDuplicateKeyError(error, duplicateConstraints);
  }
};

export const deleteTeam = async (id) => {
  return Team.findByIdAndDelete(id);
};

import Department from "../models/Department.js";
import Team from "../models/Team.js";
import User from "../models/User.js";

const validateDepartment = async (departmentId) => {
  const department = await Department.findById(
    departmentId
  );

  if (!department) {
    throw new Error("Department not found");
  }

  return department;
};

const validateTeamLead = async (teamLeadId) => {
  if (!teamLeadId) {
    return null;
  }

  const user = await User.findById(teamLeadId);

  if (!user) {
    throw new Error("Team lead user not found");
  }

  if (
    !["team_lead", "manager"].includes(user.role)
  ) {
    throw new Error(
      "Selected user must be a team lead or manager"
    );
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
    throw new Error(
      "Team name or code already exists"
    );
  }

  return Team.create(data);
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

  return Team.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("department", "name code")
    .populate("teamLead", "name email role");
};

export const deleteTeam = async (id) => {
  return Team.findByIdAndDelete(id);
};
import Employee from "../models/Employee.js";
import User from "../models/User.js";

import {
  validateManager,
  validateOrganization,
  validateShift,
  validateTeamLead,
} from "./employeeValidationService.js";

const ALLOWED_ROLES = [
  "employee",
  "team_lead",
  "manager",
];

const generateEmployeeId = async () => {
  const count = await Employee.countDocuments();

  return `TH-${String(count + 1).padStart(
    4,
    "0"
  )}`;
};

export const createEmployee = async (data) => {
  const {
    name,
    email,
    password,
    role = "employee",
    department,
    designation,
    team,
    manager,
    teamLead,
  } = data;

  if (!name || !email || !password) {
    throw new Error(
      "Name, email and password are required"
    );
  }

  if (!department || !designation) {
    throw new Error(
      "Department and designation are required"
    );
  }

  if (!ALLOWED_ROLES.includes(role)) {
    throw new Error("Invalid employee role");
  }

  const existingUser = await User.findOne({
    email: email.toLowerCase(),
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  await validateOrganization({
    department,
    designation,
    team,
  });

  await validateManager(manager);
  await validateTeamLead(teamLead);
  await validateShift(data.shift);

  const employeeId = await generateEmployeeId();

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  try {
    return await Employee.create({
      ...data,
      employeeId,
      user: user._id,
    });
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw error;
  }
};
import AppError from "../utils/AppError.js";
import Employee from "../models/Employee.js";
import Project from "../models/Project.js";
import Timesheet from "../models/Timesheet.js";

export const getEmployeeByUser = async (
  userId
) => {
  const employee = await Employee.findOne({
    user: userId,
  });

  if (!employee) {
    throw new AppError("Employee profile not found", 400);
  }

  return employee;
};

export const validateProjectAccess = async (
  employeeId,
  projectId
) => {
  const project = await Project.findById(
    projectId
  );

  if (!project) {
    throw new AppError("Project not found", 400);
  }

  const isManager =
    String(project.manager) ===
    String(employeeId);

  const isMember = project.members.some(
    (memberId) =>
      String(memberId) === String(employeeId)
  );

  if (!isManager && !isMember) {
    throw new AppError("Employee is not assigned to this project", 400);
  }

  return project;
};

export const validateWorkDate = (
  workDate
) => {
  const date = new Date(
    `${workDate}T00:00:00Z`
  );

  if (Number.isNaN(date.getTime())) {
    throw new AppError("Invalid work date", 400);
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (date > today) {
    throw new AppError("Future timesheets are not allowed", 400);
  }
};

export const validateDailyHours = async (
  employeeId,
  workDate,
  newHours,
  excludeId = null
) => {
  const filter = {
    employee: employeeId,
    workDate,
  };

  if (excludeId) {
    filter._id = {
      $ne: excludeId,
    };
  }

  const entries = await Timesheet.find(
    filter
  ).select("hours");

  const existingHours = entries.reduce(
    (total, entry) =>
      total + entry.hours,
    0
  );

  if (
    existingHours + Number(newHours) >
    24
  ) {
    throw new AppError("Total daily timesheet hours cannot exceed 24", 400);
  }
};

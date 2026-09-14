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
    throw new Error(
      "Employee profile not found"
    );
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
    throw new Error("Project not found");
  }

  const isManager =
    String(project.manager) ===
    String(employeeId);

  const isMember = project.members.some(
    (memberId) =>
      String(memberId) === String(employeeId)
  );

  if (!isManager && !isMember) {
    throw new Error(
      "Employee is not assigned to this project"
    );
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
    throw new Error("Invalid work date");
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (date > today) {
    throw new Error(
      "Future timesheets are not allowed"
    );
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
    throw new Error(
      "Total daily timesheet hours cannot exceed 24"
    );
  }
};
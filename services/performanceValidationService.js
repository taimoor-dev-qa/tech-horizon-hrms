import Employee from "../models/Employee.js";

import ROLES from "../constants/roles.js";

const REVIEWER_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN,
  ROLES.MANAGER,
  ROLES.TEAM_LEAD,
];

export const getValidEmployee = async (
  employeeId
) => {
  const employee = await Employee.findById(
    employeeId
  );

  if (!employee) {
    throw new Error("Employee not found");
  }

  return employee;
};

export const validateReviewerAccess = async (
  actor,
  employee
) => {
  if (!REVIEWER_ROLES.includes(actor.role)) {
    throw new Error(
      "You cannot create performance reviews"
    );
  }

  if (
    [
      ROLES.SUPER_ADMIN,
      ROLES.HR_ADMIN,
    ].includes(actor.role)
  ) {
    return;
  }

  const isManager =
    String(employee.manager || "") ===
    String(actor._id);

  const isTeamLead =
    String(employee.teamLead || "") ===
    String(actor._id);

  if (!isManager && !isTeamLead) {
    throw new Error(
      "You cannot review this employee"
    );
  }
};

export const validateReviewDates = (
  periodStart,
  periodEnd
) => {
  const start = new Date(
    `${periodStart}T00:00:00Z`
  );

  const end = new Date(
    `${periodEnd}T00:00:00Z`
  );

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    throw new Error(
      "Invalid performance review dates"
    );
  }

  if (start > end) {
    throw new Error(
      "Period start cannot be after period end"
    );
  }
};

export const calculateOverallScore = (
  ratings
) => {
  const values = [
    ratings.technicalSkills,
    ratings.productivity,
    ratings.communication,
    ratings.teamwork,
    ratings.attendance,
  ].map(Number);

  const invalid = values.some(
    (value) =>
      Number.isNaN(value) ||
      value < 1 ||
      value > 5
  );

  if (invalid) {
    throw new Error(
      "All ratings must be between 1 and 5"
    );
  }

  const total = values.reduce(
    (sum, value) => sum + value,
    0
  );

  return Number(
    (total / values.length).toFixed(2)
  );
};
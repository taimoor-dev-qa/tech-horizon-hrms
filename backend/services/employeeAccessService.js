import Employee from "../models/Employee.js";
import ROLES from "../constants/roles.js";
import AppError from "../utils/AppError.js";

const FULL_ACCESS_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN,
];

export const EMPLOYEE_DIRECTORY_FIELDS = [
  "employeeId",
  "user",
  "department",
  "designation",
  "team",
  "manager",
  "teamLead",
  "shift",
  "joiningDate",
  "employmentType",
  "workLocation",
  "status",
].join(" ");

export const hasFullEmployeeAccess = (actor) =>
  FULL_ACCESS_ROLES.includes(actor?.role);

export const applyEmployeeAccessScope = (
  actor,
  filter = {}
) => {
  if (hasFullEmployeeAccess(actor)) {
    return filter;
  }

  if (!actor?._id) {
    throw new AppError(
      "Authentication required",
      401
    );
  }

  const directReportFilter = {
    $or: [
      { manager: actor._id },
      { teamLead: actor._id },
    ],
  };

  if (!Object.keys(filter).length) {
    return directReportFilter;
  }

  return {
    $and: [
      directReportFilter,
      filter,
    ],
  };
};

export const getAccessibleEmployeeIds = async (
  actor,
  filter = {}
) => {
  if (
    hasFullEmployeeAccess(actor) &&
    !Object.keys(filter).length
  ) {
    return null;
  }

  const employees = await Employee.find(
    applyEmployeeAccessScope(actor, filter)
  ).select("_id");

  return employees.map((employee) => employee._id);
};

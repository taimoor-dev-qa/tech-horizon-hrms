import AppError from "../utils/AppError.js";
import Employee from "../models/Employee.js";

const validateEmployee = async (
  employeeId,
  label
) => {
  const employee = await Employee.findById(
    employeeId
  );

  if (!employee) {
    throw new AppError(`${label} not found`, 400);
  }

  return employee;
};

export const validateProjectManager = async (
  managerId
) => {
  const employee = await validateEmployee(
    managerId,
    "Project manager"
  );

  await employee.populate("user");

  if (
    !["manager", "team_lead"].includes(
      employee.user?.role
    )
  ) {
    throw new AppError("Project manager must have manager or team lead role", 400);
  }
};

export const validateProjectMembers = async (
  members = []
) => {
  const uniqueMembers = [
    ...new Set(members.map(String)),
  ];

  if (uniqueMembers.length !== members.length) {
    throw new AppError("Duplicate project members are not allowed", 400);
  }

  const count = await Employee.countDocuments({
    _id: { $in: uniqueMembers },
  });

  if (count !== uniqueMembers.length) {
    throw new AppError("One or more project members were not found", 400);
  }
};

export const validateProjectDates = (
  startDate,
  deadline
) => {
  const start = new Date(
    `${startDate}T00:00:00Z`
  );

  const end = new Date(
    `${deadline}T00:00:00Z`
  );

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    throw new AppError("Invalid project dates", 400);
  }

  if (start > end) {
    throw new AppError("Project deadline cannot be before start date", 400);
  }
};

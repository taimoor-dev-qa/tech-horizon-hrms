import Employee from "../models/Employee.js";

const validateEmployee = async (
  employeeId,
  label
) => {
  const employee = await Employee.findById(
    employeeId
  );

  if (!employee) {
    throw new Error(`${label} not found`);
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
    throw new Error(
      "Project manager must have manager or team lead role"
    );
  }
};

export const validateProjectMembers = async (
  members = []
) => {
  const uniqueMembers = [
    ...new Set(members.map(String)),
  ];

  if (uniqueMembers.length !== members.length) {
    throw new Error(
      "Duplicate project members are not allowed"
    );
  }

  const count = await Employee.countDocuments({
    _id: { $in: uniqueMembers },
  });

  if (count !== uniqueMembers.length) {
    throw new Error(
      "One or more project members were not found"
    );
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
    throw new Error("Invalid project dates");
  }

  if (start > end) {
    throw new Error(
      "Project deadline cannot be before start date"
    );
  }
};
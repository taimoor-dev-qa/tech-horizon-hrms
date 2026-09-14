import Employee from "../models/Employee.js";

export const getEmployeeReport = async ({
  department,
  designation,
  team,
  status,
  employmentType,
} = {}) => {
  const filter = {};

  if (department) {
    filter.department = department;
  }

  if (designation) {
    filter.designation = designation;
  }

  if (team) {
    filter.team = team;
  }

  if (status) {
    filter.status = status;
  }

  if (employmentType) {
    filter.employmentType = employmentType;
  }

  const employees = await Employee.find(filter)
    .populate("user", "name email role")
    .populate("department", "name code")
    .populate("designation", "name code")
    .populate("team", "name code")
    .populate("shift", "name code")
    .sort({ joiningDate: -1 });

  const summary = {
    total: employees.length,
    active: 0,
    inactive: 0,
    onLeave: 0,
    resigned: 0,
    terminated: 0,
  };

  employees.forEach((employee) => {
    if (employee.status === "active") {
      summary.active += 1;
    }

    if (employee.status === "inactive") {
      summary.inactive += 1;
    }

    if (employee.status === "on_leave") {
      summary.onLeave += 1;
    }

    if (employee.status === "resigned") {
      summary.resigned += 1;
    }

    if (employee.status === "terminated") {
      summary.terminated += 1;
    }
  });

  return {
    summary,
    employees,
  };
};
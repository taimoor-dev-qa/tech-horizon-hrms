import Employee from "../models/Employee.js";
import User from "../models/User.js";

import {
  EMPLOYEE_STATUS,
} from "../constants/employee.js";

import {
  getEmployeeById,
} from "./employeeQueryService.js";

const DISABLED_STATUSES = [
  EMPLOYEE_STATUS.INACTIVE,
  EMPLOYEE_STATUS.RESIGNED,
  EMPLOYEE_STATUS.TERMINATED,
];

export const setEmployeeStatus = async (
  id,
  status
) => {
  const validStatuses = Object.values(
    EMPLOYEE_STATUS
  );

  if (!validStatuses.includes(status)) {
    throw new Error("Invalid employee status");
  }

  const employee = await Employee.findById(id);

  if (!employee) {
    return null;
  }

  employee.status = status;

  await employee.save();

  const shouldDisable =
    DISABLED_STATUSES.includes(status);

  await User.findByIdAndUpdate(
    employee.user,
    {
      isActive: !shouldDisable,
    }
  );

  return getEmployeeById(id);
};

export const deactivateEmployee = async (
  id
) => {
  return setEmployeeStatus(
    id,
    EMPLOYEE_STATUS.INACTIVE
  );
};

export const reactivateEmployee = async (
  id
) => {
  return setEmployeeStatus(
    id,
    EMPLOYEE_STATUS.ACTIVE
  );
};
import Employee
  from "../models/Employee.js";

import User
  from "../models/User.js";

import {
  EMPLOYEE_STATUS,
} from "../constants/employee.js";

import {
  getEmployeeById,
} from "./employeeQueryService.js";

import runTransaction
  from "../utils/runTransaction.js";

const DISABLED_STATUSES = [
  EMPLOYEE_STATUS.INACTIVE,
  EMPLOYEE_STATUS.RESIGNED,
  EMPLOYEE_STATUS.TERMINATED,
];

export const setEmployeeStatus =
  async (
    id,
    status,
    actor
  ) => {
    const validStatuses =
      Object.values(
        EMPLOYEE_STATUS
      );

    if (
      !validStatuses.includes(
        status
      )
    ) {
      throw new Error(
        "Invalid employee status"
      );
    }

    const employeeId =
      await runTransaction(
        async (session) => {
          const employee =
            await Employee
              .findById(id)
              .session(
                session
              );

          if (!employee) {
            return null;
          }

          employee.status =
            status;

          await employee.save({
            session,
          });

          const shouldDisable =
            DISABLED_STATUSES.includes(
              status
            );

          await User.findByIdAndUpdate(
            employee.user,

            {
              isActive:
                !shouldDisable,
            },

            {
              session,
              runValidators: true,
            }
          );

          return employee._id;
        }
      );

    if (!employeeId) {
      return null;
    }

    return getEmployeeById(
      actor,
      employeeId
    );
  };

export const deactivateEmployee =
  async (
    id,
    actor
  ) => {
    return setEmployeeStatus(
      id,
      EMPLOYEE_STATUS.INACTIVE,
      actor
    );
  };

export const reactivateEmployee =
  async (
    id,
    actor
  ) => {
    return setEmployeeStatus(
      id,
      EMPLOYEE_STATUS.ACTIVE,
      actor
    );
  };
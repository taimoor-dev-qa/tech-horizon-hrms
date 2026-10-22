import AppError from "../utils/AppError.js";
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
import {
  PRIVILEGED_ROLES,
} from "../validators/adminUserValidators.js";

const DISABLED_STATUSES = [
  EMPLOYEE_STATUS.INACTIVE,
  EMPLOYEE_STATUS.RESIGNED,
  EMPLOYEE_STATUS.TERMINATED,
];

const END_STATUSES = [
  EMPLOYEE_STATUS.RESIGNED,
  EMPLOYEE_STATUS.TERMINATED,
];

const parseDate = (
  value
) => {
  return new Date(
    `${value}T00:00:00Z`
  );
};

const validateEmploymentEndDate = (
  employee,
  employmentEndDate
) => {
  if (!employmentEndDate) {
    throw new AppError("Employment end date is required", 400);
  }

  const endDate =
    parseDate(
      employmentEndDate
    );

  const joiningDate =
    new Date(
      employee.joiningDate
    );

  if (
    endDate < joiningDate
  ) {
    throw new AppError("Employment end date cannot be before joining date", 400);
  }

  const today =
    new Date();

  const todayUtc =
    new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate()
      )
    );

  if (
    endDate > todayUtc
  ) {
    throw new AppError("Employment end date cannot be in the future", 400);
  }

  return endDate;
};

export const setEmployeeStatus =
  async (
    id,
    status,
    actor,
    employmentEndDate = null
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
      throw new AppError("Invalid employee status", 400);
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

          const linkedUser =
            await User.findById(
              employee.user
            ).session(session);

          const shouldDisable =
            DISABLED_STATUSES.includes(
              status
            );

          if (
            linkedUser &&
            PRIVILEGED_ROLES.includes(
              linkedUser.role
            )
          ) {
            throw new AppError(
              "Privileged accounts must be managed through the admin user workflow",
              403
            );
          }

          if (
            shouldDisable &&
            linkedUser &&
            actor?._id &&
            String(linkedUser._id) ===
              String(actor._id)
          ) {
            throw new AppError(
              "You cannot deactivate your own account",
              400
            );
          }

          employee.status =
            status;

          if (
            END_STATUSES.includes(
              status
            )
          ) {
            employee
              .employmentEndDate =
              validateEmploymentEndDate(
                employee,
                employmentEndDate
              );
          } else {
            employee
              .employmentEndDate =
              null;
          }

          await employee.save({
            session,
          });

          await User
            .findByIdAndUpdate(
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

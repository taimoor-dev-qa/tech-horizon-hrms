import AppError from "../utils/AppError.js";
import Employee
  from "../models/Employee.js";

import User
  from "../models/User.js";

import {
  validateManager,
  validateOrganization,
  validateShift,
  validateTeamLead,
} from "./employeeValidationService.js";

import {
  getNextEmployeeId,
} from "./sequenceService.js";

import runTransaction
  from "../utils/runTransaction.js";
import { mapDuplicateKeyError } from "../utils/mongoDuplicateKey.js";

const duplicateConstraints = [
  { fields: ["email"], message: "Email already exists" },
  { fields: ["cnic"], message: "CNIC already exists" },
];

const ALLOWED_ROLES = [
  "employee",
  "team_lead",
  "manager",
];

const createEmployeeInSession =
  async (
    data,
    session
  ) => {
    const {
      name,
      email,
      password,
      role = "employee",
      department,
      designation,
      team,
      manager,
      teamLead,
    } = data;

    if (
      !name ||
      !email ||
      !password
    ) {
      throw new AppError("Name, email and password are required", 400);
    }

    if (
      !department ||
      !designation
    ) {
      throw new AppError("Department and designation are required", 400);
    }

    if (
      !ALLOWED_ROLES.includes(
        role
      )
    ) {
      throw new AppError("Invalid employee role", 400);
    }

    const existingUser =
      await User.findOne({
        email:
          email.toLowerCase(),
      }).session(session);

    if (existingUser) {
      throw new AppError("Email already exists", 400);
    }

    await validateOrganization(
      {
        department,
        designation,
        team,
      },
      session
    );

    await validateManager(
      manager,
      session
    );

    await validateTeamLead(
      teamLead,
      session
    );

    await validateShift(
      data.shift,
      session
    );

    const employeeId =
      await getNextEmployeeId(
        session
      );

    const user =
      new User({
        name,
        email,
        password,
        role,
        mustChangePassword: true,
      });

    await user.save({
      session,
    });

    const employee =
      new Employee({
        ...data,
        employeeId,
        user: user._id,
      });

    await employee.save({
      session,
    });

    return employee;
  };

export const createEmployee =
  async (
    data,
    session = null
  ) => {
    /*
     * Candidate Hire already
     * transaction chala raha hota hai.
     *
     * Isliye supplied session ko
     * directly reuse karna hai.
     */
    try {
      if (session) {
        return await createEmployeeInSession(
          data,
          session
        );
      }

      /*
       * Normal HR employee creation bhi
       * ab transaction-safe hai.
       */
      return await runTransaction(
        async (
          transactionSession
        ) => {
          return createEmployeeInSession(
            data,
            transactionSession
          );
        }
      );
    } catch (error) {
      throw mapDuplicateKeyError(error, duplicateConstraints);
    }
  };

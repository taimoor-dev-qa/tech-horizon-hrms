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
      throw new Error(
        "Name, email and password are required"
      );
    }

    if (
      !department ||
      !designation
    ) {
      throw new Error(
        "Department and designation are required"
      );
    }

    if (
      !ALLOWED_ROLES.includes(
        role
      )
    ) {
      throw new Error(
        "Invalid employee role"
      );
    }

    const existingUser =
      await User.findOne({
        email:
          email.toLowerCase(),
      }).session(session);

    if (existingUser) {
      throw new Error(
        "Email already exists"
      );
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
    if (session) {
      return createEmployeeInSession(
        data,
        session
      );
    }

    /*
     * Normal HR employee creation bhi
     * ab transaction-safe hai.
     */
    return runTransaction(
      async (
        transactionSession
      ) => {
        return createEmployeeInSession(
          data,
          transactionSession
        );
      }
    );
  };
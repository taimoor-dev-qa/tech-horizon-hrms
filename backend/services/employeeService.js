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

const ALLOWED_ROLES = [
  "employee",
  "team_lead",
  "manager",
];

const generateEmployeeId =
  async (
    session = null
  ) => {
    let query =
      Employee.countDocuments();

    if (session) {
      query =
        query.session(session);
    }

    const count =
      await query;

    return `TH-${String(
      count + 1
    ).padStart(4, "0")}`;
  };

export const createEmployee =
  async (
    data,
    session = null
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

    let existingUserQuery =
      User.findOne({
        email:
          email.toLowerCase(),
      });

    if (session) {
      existingUserQuery =
        existingUserQuery.session(
          session
        );
    }

    const existingUser =
      await existingUserQuery;

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
      await generateEmployeeId(
        session
      );

    const user =
      new User({
        name,
        email,
        password,
        role,
      });

    await user.save(
      session
        ? { session }
        : {}
    );

    try {
      const employee =
        new Employee({
          ...data,
          employeeId,
          user: user._id,
        });

      await employee.save(
        session
          ? { session }
          : {}
      );

      return employee;
    } catch (error) {
      /*
       * Transaction ho to MongoDB
       * khud rollback karega.
       *
       * Normal employee creation ho
       * to old cleanup behaviour
       * preserve karna hai.
       */
      if (!session) {
        await User.findByIdAndDelete(
          user._id
        );
      }

      throw error;
    }
  };
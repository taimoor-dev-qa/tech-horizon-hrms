import Counter
  from "../models/Counter.js";

import Employee
  from "../models/Employee.js";

const EMPLOYEE_COUNTER =
  "employee";

const withSession = (
  query,
  session
) => {
  return session
    ? query.session(session)
    : query;
};

const getExistingMaxEmployeeNumber =
  async (
    session = null
  ) => {
    let query =
      Employee.find({
        employeeId: {
          $regex:
            /^TH-\d+$/,
        },
      })
        .select("employeeId")
        .lean();

    query =
      withSession(
        query,
        session
      );

    const employees =
      await query;

    return employees.reduce(
      (
        max,
        employee
      ) => {
        const number =
          Number(
            employee
              .employeeId
              .replace(
                "TH-",
                ""
              )
          );

        return Number.isInteger(
          number
        )
          ? Math.max(
              max,
              number
            )
          : max;
      },
      0
    );
  };

const initializeEmployeeCounter =
  async (
    session = null
  ) => {
    const maxExisting =
      await getExistingMaxEmployeeNumber(
        session
      );

    const options = {
      new: true,
      upsert: true,
      setDefaultsOnInsert:
        true,
    };

    if (session) {
      options.session =
        session;
    }

    return Counter.findOneAndUpdate(
      {
        _id:
          EMPLOYEE_COUNTER,
      },

      {
        $setOnInsert: {
          seq:
            maxExisting,
        },
      },

      options
    );
  };

export const getNextEmployeeId =
  async (
    session = null
  ) => {
    let counterQuery =
      Counter.findById(
        EMPLOYEE_COUNTER
      );

    counterQuery =
      withSession(
        counterQuery,
        session
      );

    let counter =
      await counterQuery;

    if (!counter) {
      counter =
        await initializeEmployeeCounter(
          session
        );
    }

    const options = {
      new: true,
      runValidators: true,
    };

    if (session) {
      options.session =
        session;
    }

    const updatedCounter =
      await Counter.findOneAndUpdate(
        {
          _id:
            EMPLOYEE_COUNTER,
        },

        {
          $inc: {
            seq: 1,
          },
        },

        options
      );

    if (!updatedCounter) {
      throw new Error(
        "Employee ID sequence could not be generated"
      );
    }

    return `TH-${String(
      updatedCounter.seq
    ).padStart(4, "0")}`;
  };
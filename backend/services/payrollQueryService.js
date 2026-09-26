import Employee
  from "../models/Employee.js";

import Payroll
  from "../models/Payroll.js";

import {
  buildPagination,
  getPagination,
} from "../utils/pagination.js";

const populatePayroll = (
  query
) => {
  return query
    .populate({
      path: "employee",

      select:
        "employeeId user department designation",

      populate: [
        {
          path: "user",
          select: "name email",
        },

        {
          path: "department",
          select: "name code",
        },

        {
          path: "designation",
          select: "name code",
        },
      ],
    })

    .populate(
      "generatedBy",
      "name email role"
    );
};

export const getPayrolls =
  async ({
    employee,
    month,
    status,
    page,
    limit,
  } = {}) => {
    const filter = {};

    if (employee) {
      filter.employee =
        employee;
    }

    if (month) {
      filter.month = month;
    }

    if (status) {
      filter.status = status;
    }

    const pagination =
      getPagination({
        page,
        limit,
      });

    const [
      payrolls,
      total,
    ] =
      await Promise.all([
        populatePayroll(
          Payroll.find(filter)
            .sort({
              month: -1,
            })
            .skip(
              pagination.skip
            )
            .limit(
              pagination.limit
            )
        ),

        Payroll.countDocuments(
          filter
        ),
      ]);

    return {
      payrolls,

      pagination:
        buildPagination(
          pagination.page,
          pagination.limit,
          total
        ),
    };
  };

export const getPayrollById =
  async (id) => {
    return populatePayroll(
      Payroll.findById(id)
    );
  };

export const getMyPayrolls =
  async (
    userId,
    query = {}
  ) => {
    const employee =
      await Employee.findOne({
        user: userId,
      });

    if (!employee) {
      throw new Error(
        "Employee profile not found"
      );
    }

    const filter = {
      employee:
        employee._id,

      status: {
        $in: [
          "generated",
          "paid",
        ],
      },
    };

    const pagination =
      getPagination(
        query,
        12
      );

    const [
      payrolls,
      total,
    ] =
      await Promise.all([
        populatePayroll(
          Payroll.find(filter)
            .sort({
              month: -1,
            })
            .skip(
              pagination.skip
            )
            .limit(
              pagination.limit
            )
        ),

        Payroll.countDocuments(
          filter
        ),
      ]);

    return {
      payrolls,

      pagination:
        buildPagination(
          pagination.page,
          pagination.limit,
          total
        ),
    };
  };
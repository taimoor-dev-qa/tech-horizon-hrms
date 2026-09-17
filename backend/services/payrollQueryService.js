import Employee from "../models/Employee.js";
import Payroll from "../models/Payroll.js";

const populatePayroll = (query) => {
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

export const getPayrolls = async ({
  employee,
  month,
  status,
} = {}) => {
  const filter = {};

  if (employee) {
    filter.employee = employee;
  }

  if (month) {
    filter.month = month;
  }

  if (status) {
    filter.status = status;
  }

  return populatePayroll(
    Payroll.find(filter).sort({
      month: -1,
    })
  );
};

export const getPayrollById = async (
  id
) => {
  return populatePayroll(
    Payroll.findById(id)
  );
};

export const getMyPayrolls = async (
  userId
) => {
  const employee = await Employee.findOne({
    user: userId,
  });

  if (!employee) {
    throw new Error(
      "Employee profile not found"
    );
  }

  return populatePayroll(
    Payroll.find({
      employee: employee._id,
      status: {
        $in: ["generated", "paid"],
      },
    }).sort({
      month: -1,
    })
  );
};
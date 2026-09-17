import Employee from "../models/Employee.js";
import Payroll from "../models/Payroll.js";

import {
  PAYROLL_STATUS,
} from "../constants/payroll.js";

export const getMyPayslip = async (
  userId,
  payrollId
) => {
  const employee = await Employee.findOne({
    user: userId,
  });

  if (!employee) {
    throw new Error(
      "Employee profile not found"
    );
  }

  const payroll = await Payroll.findOne({
    _id: payrollId,
    employee: employee._id,

    status: {
      $in: [
        PAYROLL_STATUS.GENERATED,
        PAYROLL_STATUS.PAID,
      ],
    },
  })
    .populate({
      path: "employee",
      select:
        "employeeId user department designation workLocation",
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
      "name email"
    );

  if (!payroll) {
    throw new Error(
      "Payslip not found"
    );
  }

  return payroll;
};
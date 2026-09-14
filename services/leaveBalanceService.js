import Employee from "../models/Employee.js";
import LeaveBalance from "../models/LeaveBalance.js";
import LeaveRequest from "../models/LeaveRequest.js";
import LeaveType from "../models/LeaveType.js";

import {
  LEAVE_STATUS,
} from "../constants/leave.js";

const getYear = (date) => {
  return Number(date.slice(0, 4));
};

export const getOrCreateBalance = async (
  employeeId,
  leaveType,
  year
) => {
  let balance = await LeaveBalance.findOne({
    employee: employeeId,
    leaveType: leaveType._id,
    year,
  });

  if (!balance) {
    balance = await LeaveBalance.create({
      employee: employeeId,
      leaveType: leaveType._id,
      year,
      allocatedDays: leaveType.annualQuota,
      usedDays: 0,
    });
  }

  return balance;
};

export const validateRequestBalance = async (
  employeeId,
  leaveType,
  totalDays,
  startDate
) => {
  if (leaveType.annualQuota <= 0) {
    return;
  }

  const year = getYear(startDate);

  const balance = await getOrCreateBalance(
    employeeId,
    leaveType,
    year
  );

  const pending = await LeaveRequest.aggregate([
    {
      $match: {
        employee: employeeId,
        leaveType: leaveType._id,
        status: {
          $in: [
            LEAVE_STATUS.PENDING_MANAGER,
            LEAVE_STATUS.PENDING_HR,
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalDays" },
      },
    },
  ]);

  const pendingDays = pending[0]?.total || 0;

  const available =
    balance.allocatedDays -
    balance.usedDays -
    pendingDays;

  if (totalDays > available) {
    throw new Error(
      `Insufficient leave balance. Available: ${available} day(s)`
    );
  }
};

export const deductApprovedLeave = async (
  leave
) => {
  const leaveType = await LeaveType.findById(
    leave.leaveType
  );

  if (!leaveType || leaveType.annualQuota <= 0) {
    return;
  }

  const year = getYear(leave.startDate);

  const balance = await getOrCreateBalance(
    leave.employee,
    leaveType,
    year
  );

  const remaining =
    balance.allocatedDays - balance.usedDays;

  if (leave.totalDays > remaining) {
    throw new Error(
      "Insufficient leave balance"
    );
  }

  balance.usedDays += leave.totalDays;

  await balance.save();
};

export const getMyBalances = async (
  userId,
  year
) => {
  const employee = await Employee.findOne({
    user: userId,
  });

  if (!employee) {
    throw new Error("Employee profile not found");
  }

  const targetYear =
    Number(year) || new Date().getFullYear();

  const leaveTypes = await LeaveType.find({
    isActive: true,
  });

  const balances = [];

  for (const leaveType of leaveTypes) {
    const balance = await getOrCreateBalance(
      employee._id,
      leaveType,
      targetYear
    );

    balances.push({
      leaveType,
      allocatedDays: balance.allocatedDays,
      usedDays: balance.usedDays,
      remainingDays:
        balance.allocatedDays -
        balance.usedDays,
    });
  }

  return balances;
};
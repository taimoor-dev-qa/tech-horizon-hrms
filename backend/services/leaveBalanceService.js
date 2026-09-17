import Employee
  from "../models/Employee.js";

import LeaveBalance
  from "../models/LeaveBalance.js";

import LeaveRequest
  from "../models/LeaveRequest.js";

import LeaveType
  from "../models/LeaveType.js";

import {
  LEAVE_STATUS,
} from "../constants/leave.js";

import {
  getRuntimeCompanySettings,
} from "./companySettingsRuntimeService.js";

import {
  getCurrentDate,
} from "./attendanceTimeService.js";

import {
  getLeaveYear,
  getLeaveYearRange,
} from "./leavePolicyService.js";

export const getOrCreateBalance =
  async (
    employeeId,
    leaveType,
    year
  ) => {
    let balance =
      await LeaveBalance.findOne({
        employee: employeeId,
        leaveType:
          leaveType._id,
        year,
      });

    if (!balance) {
      balance =
        await LeaveBalance.create({
          employee:
            employeeId,

          leaveType:
            leaveType._id,

          year,

          allocatedDays:
            leaveType.annualQuota,

          usedDays: 0,
        });
    }

    return balance;
  };

export const validateRequestBalance =
  async (
    employeeId,
    leaveType,
    totalDays,
    startDate
  ) => {
    if (
      leaveType.annualQuota <= 0
    ) {
      return;
    }

    const settings =
      await getRuntimeCompanySettings();

    const startMonth =
      settings.leave
        .leaveYearStartMonth;

    const year =
      getLeaveYear(
        startDate,
        startMonth
      );

    const range =
      getLeaveYearRange(
        year,
        startMonth
      );

    const balance =
      await getOrCreateBalance(
        employeeId,
        leaveType,
        year
      );

    const pending =
      await LeaveRequest.aggregate([
        {
          $match: {
            employee:
              employeeId,

            leaveType:
              leaveType._id,

            startDate: {
              $gte: range.start,
              $lte: range.end,
            },

            status: {
              $in: [
                LEAVE_STATUS
                  .PENDING_MANAGER,

                LEAVE_STATUS
                  .PENDING_HR,
              ],
            },
          },
        },

        {
          $group: {
            _id: null,

            total: {
              $sum:
                "$totalDays",
            },
          },
        },
      ]);

    const pendingDays =
      pending[0]?.total || 0;

    const available =
      balance.allocatedDays -
      balance.usedDays -
      pendingDays;

    if (
      totalDays > available
    ) {
      throw new Error(
        `Insufficient leave balance. Available: ${available} day(s)`
      );
    }
  };

export const deductApprovedLeave =
  async (leave) => {
    const leaveType =
      await LeaveType.findById(
        leave.leaveType
      );

    if (
      !leaveType ||
      leaveType.annualQuota <= 0
    ) {
      return;
    }

    const settings =
      await getRuntimeCompanySettings();

    const year =
      getLeaveYear(
        leave.startDate,
        settings.leave
          .leaveYearStartMonth
      );

    const balance =
      await getOrCreateBalance(
        leave.employee,
        leaveType,
        year
      );

    const remaining =
      balance.allocatedDays -
      balance.usedDays;

    if (
      leave.totalDays >
      remaining
    ) {
      throw new Error(
        "Insufficient leave balance"
      );
    }

    balance.usedDays +=
      leave.totalDays;

    await balance.save();
  };

export const getMyBalances =
  async (
    userId,
    year
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

    const settings =
      await getRuntimeCompanySettings();

    const startMonth =
      settings.leave
        .leaveYearStartMonth;

    const today =
      getCurrentDate(
        settings.timezone
      );

    const currentLeaveYear =
      getLeaveYear(
        today,
        startMonth
      );

    const targetYear =
      year === undefined
        ? currentLeaveYear
        : Number(year);

    if (
      !Number.isInteger(
        targetYear
      )
    ) {
      throw new Error(
        "Invalid leave year"
      );
    }

    const range =
      getLeaveYearRange(
        targetYear,
        startMonth
      );

    const leaveTypes =
      await LeaveType.find({
        isActive: true,
      });

    const balances = [];

    for (
      const leaveType
      of leaveTypes
    ) {
      const balance =
        await getOrCreateBalance(
          employee._id,
          leaveType,
          targetYear
        );

      balances.push({
        leaveYear:
          targetYear,

        leaveYearStart:
          range.start,

        leaveYearEnd:
          range.end,

        leaveType,

        allocatedDays:
          balance.allocatedDays,

        usedDays:
          balance.usedDays,

        remainingDays:
          balance.allocatedDays -
          balance.usedDays,
      });
    }

    return balances;
  };
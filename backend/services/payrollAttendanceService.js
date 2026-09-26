import Attendance
  from "../models/Attendance.js";

import LeaveRequest
  from "../models/LeaveRequest.js";

import {
  ATTENDANCE_STATUS,
} from "../constants/attendance.js";

import {
  LEAVE_STATUS,
} from "../constants/leave.js";

import {
  getMonthlyWorkingDates,
} from "./payrollPeriodService.js";

import {
  getHolidayDates,
} from "./holidayQueryService.js";

import {
  getWorkingDates,
} from "./leaveDateService.js";

const countUnpaidLeaveDays =
  async (
    employee,
    startDate,
    endDate
  ) => {
    const leaves =
      await LeaveRequest.find({
        employee:
          employee._id,

        status:
          LEAVE_STATUS.APPROVED,

        startDate: {
          $lte: endDate,
        },

        endDate: {
          $gte: startDate,
        },
      }).populate(
        "leaveType"
      );

    let unpaidDays = 0;

    for (
      const leave
      of leaves
    ) {
      if (
        leave.leaveType
          ?.isPaid !== false
      ) {
        continue;
      }

      const overlapStart =
        leave.startDate >
        startDate
          ? leave.startDate
          : startDate;

      const overlapEnd =
        leave.endDate <
        endDate
          ? leave.endDate
          : endDate;

      const holidays =
        await getHolidayDates(
          overlapStart,
          overlapEnd
        );

      const dates =
        getWorkingDates(
          overlapStart,
          overlapEnd,
          employee.shift
            .workingDays,
          holidays
        );

      unpaidDays +=
        dates.length;
    }

    return unpaidDays;
  };

export const getPayrollAttendanceData =
  async (
    employee,
    month,
    payrollPeriod
  ) => {
    if (!employee.shift) {
      throw new Error(
        "Employee shift is not assigned"
      );
    }

    const monthlyWorkingDates =
      await getMonthlyWorkingDates(
        month,
        employee.shift
          .workingDays
      );

    const payableWorkingDates =
      await getMonthlyWorkingDates(
        month,
        employee.shift
          .workingDays,
        payrollPeriod.periodStart,
        payrollPeriod.periodEnd
      );

    const payableDateSet =
      new Set(
        payableWorkingDates
      );

    const attendance =
      await Attendance.find({
        employee:
          employee._id,

        attendanceDate: {
          $gte:
            payrollPeriod
              .periodStart,

          $lte:
            payrollPeriod
              .periodEnd,
        },
      }).select(
        "attendanceDate status"
      );

    const absentDays =
      attendance.filter(
        (record) =>
          payableDateSet.has(
            record
              .attendanceDate
          ) &&
          record.status ===
            ATTENDANCE_STATUS
              .ABSENT
      ).length;

    const halfDays =
      attendance.filter(
        (record) =>
          payableDateSet.has(
            record
              .attendanceDate
          ) &&
          record.status ===
            ATTENDANCE_STATUS
              .HALF_DAY
      ).length;

    const unpaidLeaveDays =
      await countUnpaidLeaveDays(
        employee,
        payrollPeriod
          .periodStart,
        payrollPeriod
          .periodEnd
      );

    return {
      totalWorkingDays:
        monthlyWorkingDates.length,

      payableWorkingDays:
        payableWorkingDates.length,

      absentDays,

      halfDays,

      unpaidLeaveDays,
    };
  };
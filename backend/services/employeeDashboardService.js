import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import LeaveRequest from "../models/LeaveRequest.js";
import Notification from "../models/Notification.js";
import Payroll from "../models/Payroll.js";
import PerformanceReview from "../models/PerformanceReview.js";
import Project from "../models/Project.js";
import Timesheet from "../models/Timesheet.js";

import {
  getCurrentDate,
} from "./attendanceTimeService.js";

export const getEmployeeDashboard = async (
  userId
) => {
  const employee = await Employee.findOne({
    user: userId,
  })
    .populate(
      "department",
      "name code"
    )
    .populate(
      "designation",
      "name code"
    )
    .populate(
      "team",
      "name code"
    )
    .populate(
      "shift",
      "name code startTime endTime"
    );

  if (!employee) {
    throw new Error(
      "Employee profile not found"
    );
  }

  const today = getCurrentDate();

  const [
    todayAttendance,
    pendingLeaves,
    projects,
    pendingTimesheets,
    latestPayroll,
    latestPerformance,
    unreadNotifications,
  ] = await Promise.all([
    Attendance.findOne({
      employee: employee._id,
      attendanceDate: today,
    }).populate(
      "shift",
      "name code startTime endTime"
    ),

    LeaveRequest.countDocuments({
      employee: employee._id,
      status: {
        $in: [
          "pending_manager",
          "pending_hr",
        ],
      },
    }),

    Project.countDocuments({
      $or: [
        {
          manager: employee._id,
        },
        {
          members: employee._id,
        },
      ],
      isActive: true,
    }),

    Timesheet.countDocuments({
      employee: employee._id,
      status: "pending",
    }),

    Payroll.findOne({
      employee: employee._id,
      status: {
        $in: [
          "generated",
          "paid",
        ],
      },
    })
      .sort({
        month: -1,
      })
      .select(
        "month netSalary status currency paidAt"
      ),

    PerformanceReview.findOne({
      employee: employee._id,
      status: {
        $in: [
          "submitted",
          "acknowledged",
        ],
      },
    })
      .sort({
        periodEnd: -1,
      })
      .select(
        "periodStart periodEnd overallScore status"
      ),

    Notification.countDocuments({
      recipient: userId,
      isRead: false,
    }),
  ]);

  return {
    date: today,

    employee: {
      employeeId:
        employee.employeeId,

      department:
        employee.department,

      designation:
        employee.designation,

      team:
        employee.team,

      shift:
        employee.shift,

      status:
        employee.status,

      joiningDate:
        employee.joiningDate,
    },

    attendance: todayAttendance,

    leaves: {
      pendingRequests:
        pendingLeaves,
    },

    projects: {
      totalAssigned: projects,
    },

    timesheets: {
      pending:
        pendingTimesheets,
    },

    payroll: latestPayroll,

    performance:
      latestPerformance,

    notifications: {
      unread:
        unreadNotifications,
    },
  };
};
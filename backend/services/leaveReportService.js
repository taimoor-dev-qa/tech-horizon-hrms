import LeaveRequest
  from "../models/LeaveRequest.js";

import Employee from "../models/Employee.js";

import {
  validateDateRange,
} from "./reportValidationService.js";

export const getLeaveReport = async ({
  startDate,
  endDate,
  employee,
  department,
  status,
  leaveType,
} = {}) => {
  validateDateRange(
    startDate,
    endDate
  );

  const filter = {};

  if (employee) {
    filter.employee = employee;
  }

  if (status) {
    filter.status = status;
  }

  if (leaveType) {
    filter.leaveType = leaveType;
  }

  if (startDate && endDate) {
    filter.startDate = {
      $lte: endDate,
    };

    filter.endDate = {
      $gte: startDate,
    };
  }

  if (department) {
    const employees =
      await Employee.find({
        department,
      }).select("_id");

    filter.employee = {
      $in: employees.map(
        (item) => item._id
      ),
    };
  }

  const leaves = await LeaveRequest.find(
    filter
  )
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
      ],
    })
    .populate(
      "leaveType",
      "name code isPaid"
    )
    .sort({ createdAt: -1 });

  const summary = {
    totalRequests: leaves.length,
    totalDays: 0,
    pendingManager: 0,
    pendingHr: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
  };

  leaves.forEach((leave) => {
    summary.totalDays +=
      leave.totalDays || 0;

    if (
      leave.status ===
      "pending_manager"
    ) {
      summary.pendingManager += 1;
    }

    if (
      leave.status ===
      "pending_hr"
    ) {
      summary.pendingHr += 1;
    }

    if (leave.status === "approved") {
      summary.approved += 1;
    }

    if (leave.status === "rejected") {
      summary.rejected += 1;
    }

    if (leave.status === "cancelled") {
      summary.cancelled += 1;
    }
  });

  return {
    summary,
    leaves,
  };
};
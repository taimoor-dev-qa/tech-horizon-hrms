import LeaveRequest
  from "../models/LeaveRequest.js";

import {
  validateDateRange,
} from "./reportValidationService.js";
import {
  getAccessibleEmployeeIds,
} from "./employeeAccessService.js";

export const getLeaveReport = async (
  actor,
  {
    startDate,
    endDate,
    employee,
    department,
    status,
    leaveType,
  } = {}
) => {
  validateDateRange(
    startDate,
    endDate
  );

  const filter = {};

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

  const employeeFilter = {};

  if (employee) {
    employeeFilter._id = employee;
  }

  if (department) {
    employeeFilter.department = department;
  }

  const employees =
    await getAccessibleEmployeeIds(
      actor,
      employeeFilter
    );

  if (employees) {
    filter.employee = {
      $in: employees,
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

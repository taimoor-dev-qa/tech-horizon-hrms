import LeaveRequest
  from "../models/LeaveRequest.js";

import {
  LEAVE_STATUS,
} from "../constants/leave.js";

const populateLeave = (query) => {
  return query
    .populate({
      path: "employee",
      select:
        "employeeId user department designation manager",
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
      "leaveType",
      "name code annualQuota isPaid"
    );
};

export const getManagerPending = async (
  managerId
) => {
  return populateLeave(
    LeaveRequest.find({
      status:
        LEAVE_STATUS.PENDING_MANAGER,
    })
  ).then((leaves) =>
    leaves.filter(
      (leave) =>
        String(leave.employee?.manager) ===
        String(managerId)
    )
  );
};

export const getHrPending = async () => {
  return populateLeave(
    LeaveRequest.find({
      status: LEAVE_STATUS.PENDING_HR,
    }).sort({ createdAt: 1 })
  );
};
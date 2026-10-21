import asyncHandler from "../utils/asyncHandler.js";
import * as leaveRequestService
  from "../services/leaveRequestService.js";

export const applyLeave = asyncHandler(async (req, res) => {
  const leave =
    await leaveRequestService
      .createLeaveRequest(
        req.user._id,
        req.body
      );

  res.status(201).json({
    success: true,
    message:
      "Leave request submitted successfully",
    leave,
  });
});

export const getMyLeaves = asyncHandler(async (req, res) => {
  const leaves =
    await leaveRequestService
      .getMyLeaveRequests(
        req.user._id
      );

  res.status(200).json({
    success: true,
    count: leaves.length,
    leaves,
  });
});

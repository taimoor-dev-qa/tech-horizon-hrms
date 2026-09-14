import * as leaveRequestService
  from "../services/leaveRequestService.js";

export const applyLeave = async (
  req,
  res
) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyLeaves = async (
  req,
  res
) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
import asyncHandler from "../utils/asyncHandler.js";
import {
  getHrPending,
  getManagerPending,
} from "../services/leaveApprovalQueryService.js";

import {
  hrDecision,
  managerDecision,
} from "../services/leaveApprovalService.js";

export const getManagerLeaves = asyncHandler(async (req, res) => {
  const leaves = await getManagerPending(
    req.user._id
  );

  res.status(200).json({
    success: true,
    count: leaves.length,
    leaves,
  });
});

export const getHrLeaves = asyncHandler(async (req, res) => {
  const leaves = await getHrPending();

  res.status(200).json({
    success: true,
    count: leaves.length,
    leaves,
  });
});

export const reviewByManager = asyncHandler(async (req, res) => {
  const leave = await managerDecision(
    req.params.id,
    req.user,
    req.body.decision,
    req.body.comment
  );

  res.status(200).json({
    success: true,
    message:
      "Manager decision saved successfully",
    leave,
  });
});

export const reviewByHr = asyncHandler(async (req, res) => {
  const leave = await hrDecision(
    req.params.id,
    req.user,
    req.body.decision,
    req.body.comment
  );

  res.status(200).json({
    success: true,
    message:
      "HR decision saved successfully",
    leave,
  });
});

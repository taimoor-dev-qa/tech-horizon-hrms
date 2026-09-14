import {
  getHrPending,
  getManagerPending,
} from "../services/leaveApprovalQueryService.js";

import {
  hrDecision,
  managerDecision,
} from "../services/leaveApprovalService.js";

export const getManagerLeaves = async (
  req,
  res
) => {
  try {
    const leaves = await getManagerPending(
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

export const getHrLeaves = async (
  req,
  res
) => {
  try {
    const leaves = await getHrPending();

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

export const reviewByManager = async (
  req,
  res
) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const reviewByHr = async (
  req,
  res
) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
import {
  cancelInterview as cancelService,
} from "../services/interviewService.js";

import {
  completeInterview as completeService,
} from "../services/interviewResultService.js";

export const cancelInterview = async (
  req,
  res
) => {
  try {
    const interview = await cancelService(
      req.params.id
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Interview cancelled successfully",
      interview,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const completeInterview = async (
  req,
  res
) => {
  try {
    const interview = await completeService(
      req.params.id,
      req.user,
      req.body
    );

    res.status(200).json({
      success: true,
      message:
        "Interview completed successfully",
      interview,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
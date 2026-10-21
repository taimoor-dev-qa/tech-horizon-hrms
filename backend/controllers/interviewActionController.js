import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  cancelInterview as cancelService,
} from "../services/interviewService.js";

import {
  completeInterview as completeService,
} from "../services/interviewResultService.js";

export const cancelInterview = asyncHandler(async (req, res) => {
  const interview = await cancelService(
    req.params.id
  );

  if (!interview) {
    throw new AppError("Interview not found", 404);
  }

  res.status(200).json({
    success: true,
    message:
      "Interview cancelled successfully",
    interview,
  });
});

export const completeInterview = asyncHandler(async (req, res) => {
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
});

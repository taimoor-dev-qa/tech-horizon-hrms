import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createInterview as createService,
  updateInterview as updateService,
} from "../services/interviewService.js";

import {
  getInterviewById as getByIdService,
  getInterviews as getInterviewsService,
  getMyInterviews as getMyService,
} from "../services/interviewQueryService.js";

export const createInterview = asyncHandler(async (req, res) => {
  const interview = await createService(
    req.body,
    req.user._id
  );

  res.status(201).json({
    success: true,
    message:
      "Interview scheduled successfully",
    interview,
  });
});

export const getInterviews = asyncHandler(async (req, res) => {
  const result =
    await getInterviewsService(
      req.query
    );

  res.status(200).json({
    success: true,

    count:
      result
        .interviews
        .length,

    pagination:
      result.pagination,

    interviews:
      result.interviews,
  });
});

export const getMyInterviews = asyncHandler(async (req, res) => {
  const result =
    await getMyService(
      req.user._id,
      req.query
    );

  res.status(200).json({
    success: true,

    count:
      result
        .interviews
        .length,

    pagination:
      result.pagination,

    interviews:
      result.interviews,
  });
});

export const getInterviewById = asyncHandler(async (req, res) => {
  const interview =
    await getByIdService(
      req.user,
      req.params.id
    );

  if (!interview) {
    throw new AppError("Interview not found", 404);
  }

  res.status(200).json({
    success: true,
    interview,
  });
});

export const updateInterview = asyncHandler(async (req, res) => {
  const interview = await updateService(
    req.params.id,
    req.body
  );

  if (!interview) {
    throw new AppError("Interview not found", 404);
  }

  res.status(200).json({
    success: true,
    message:
      "Interview updated successfully",
    interview,
  });
});

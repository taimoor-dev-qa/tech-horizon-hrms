import {
  createInterview as createService,
  updateInterview as updateService,
} from "../services/interviewService.js";

import {
  getInterviewById as getByIdService,
  getInterviews as getInterviewsService,
  getMyInterviews as getMyService,
} from "../services/interviewQueryService.js";

export const createInterview = async (
  req,
  res
) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInterviews = async (
  req,
  res
) => {
  try {
    const interviews =
      await getInterviewsService(req.query);

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyInterviews = async (
  req,
  res
) => {
  try {
    const interviews = await getMyService(
      req.user._id
    );

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInterviewById = async (
  req,
  res
) => {
  try {
    const interview = await getByIdService(
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
      interview,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateInterview = async (
  req,
  res
) => {
  try {
    const interview = await updateService(
      req.params.id,
      req.body
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
        "Interview updated successfully",
      interview,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
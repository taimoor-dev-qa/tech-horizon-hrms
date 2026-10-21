import AppError from "../utils/AppError.js";
import Interview from "../models/Interview.js";

import ROLES from "../constants/roles.js";

import {
  INTERVIEW_RESULT,
  INTERVIEW_STATUS,
} from "../constants/interview.js";

const VALID_RESULTS = [
  INTERVIEW_RESULT.PASS,
  INTERVIEW_RESULT.FAIL,
];

export const completeInterview = async (
  id,
  actor,
  data
) => {
  const interview = await Interview.findById(
    id
  );

  if (!interview) {
    throw new AppError("Interview not found", 400);
  }

  if (
    interview.status !==
    INTERVIEW_STATUS.SCHEDULED
  ) {
    throw new AppError("Interview is not awaiting completion", 400);
  }

  const isInterviewer =
    String(interview.interviewer) ===
    String(actor._id);

  const hasAdminAccess = [
    ROLES.SUPER_ADMIN,
    ROLES.HR_ADMIN,
  ].includes(actor.role);

  if (!isInterviewer && !hasAdminAccess) {
    throw new AppError("You cannot review this interview", 400);
  }

  if (!VALID_RESULTS.includes(data.result)) {
    throw new AppError("Result must be pass or fail", 400);
  }

  interview.status =
    INTERVIEW_STATUS.COMPLETED;

  interview.result = data.result;

  interview.feedback =
    data.feedback || "";

  if (data.rating !== undefined) {
    interview.rating = data.rating;
  }

  await interview.save();

  return interview;
};

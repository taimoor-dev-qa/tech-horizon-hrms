import ROLES
  from "../constants/roles.js";

import {
  JOB_STATUS,
} from "../constants/recruitment.js";

import AppError
  from "../utils/AppError.js";

const FULL_ACCESS_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN,
];

export const hasFullRecruitmentAccess = (
  actor
) => {
  return FULL_ACCESS_ROLES.includes(
    actor.role
  );
};

export const validateInterviewReadAccess = (
  actor,
  interview
) => {
  if (
    hasFullRecruitmentAccess(actor)
  ) {
    return true;
  }

  const isAssignedInterviewer =
    String(
      interview.interviewer
    ) === String(actor._id);

  if (!isAssignedInterviewer) {
    throw new AppError(
      "You do not have access to this interview",
      403
    );
  }

  return true;
};

export const applyJobReadAccess = (
  actor,
  filter,
  requestedStatus
) => {
  if (
    hasFullRecruitmentAccess(actor)
  ) {
    return filter;
  }

  if (
    requestedStatus &&
    requestedStatus !==
      JOB_STATUS.OPEN
  ) {
    filter._id = null;

    return filter;
  }

  filter.status =
    JOB_STATUS.OPEN;

  return filter;
};

export const validateJobReadAccess = (
  actor,
  job
) => {
  if (
    hasFullRecruitmentAccess(actor)
  ) {
    return true;
  }

  if (
    job.status !==
    JOB_STATUS.OPEN
  ) {
    throw new AppError(
      "You do not have access to this job",
      403
    );
  }

  return true;
};
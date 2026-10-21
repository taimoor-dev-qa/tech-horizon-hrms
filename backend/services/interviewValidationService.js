import AppError from "../utils/AppError.js";
import Candidate from "../models/Candidate.js";
import User from "../models/User.js";

import ROLES from "../constants/roles.js";

import {
  CANDIDATE_STATUS,
} from "../constants/recruitment.js";

import {
  INTERVIEW_MODES,
} from "../constants/interview.js";

const ALLOWED_INTERVIEWERS = [
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN,
  ROLES.MANAGER,
  ROLES.TEAM_LEAD,
];

export const getValidCandidate = async (
  candidateId
) => {
  const candidate = await Candidate.findById(
    candidateId
  );

  if (!candidate) {
    throw new AppError("Candidate not found", 400);
  }

  if (
    [
      CANDIDATE_STATUS.REJECTED,
      CANDIDATE_STATUS.HIRED,
    ].includes(candidate.status)
  ) {
    throw new AppError("Interview cannot be scheduled for this candidate", 400);
  }

  return candidate;
};

export const validateInterviewer = async (
  interviewerId
) => {
  const user = await User.findById(
    interviewerId
  );

  if (!user) {
    throw new AppError("Interviewer not found", 400);
  }

  if (!ALLOWED_INTERVIEWERS.includes(user.role)) {
    throw new AppError("Selected user cannot conduct interviews", 400);
  }

  return user;
};

export const validateSchedule = (
  scheduledAt
) => {
  const date = new Date(scheduledAt);

  if (Number.isNaN(date.getTime())) {
    throw new AppError("Invalid interview date and time", 400);
  }

  if (date <= new Date()) {
    throw new AppError("Interview must be scheduled in the future", 400);
  }
};

export const validateModeDetails = ({
  mode,
  location,
  meetingLink,
}) => {
  if (
    mode === INTERVIEW_MODES.ONLINE &&
    !meetingLink
  ) {
    throw new AppError("Meeting link is required for online interview", 400);
  }

  if (
    mode === INTERVIEW_MODES.ONSITE &&
    !location
  ) {
    throw new AppError("Location is required for onsite interview", 400);
  }
};

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
    throw new Error("Candidate not found");
  }

  if (
    [
      CANDIDATE_STATUS.REJECTED,
      CANDIDATE_STATUS.HIRED,
    ].includes(candidate.status)
  ) {
    throw new Error(
      "Interview cannot be scheduled for this candidate"
    );
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
    throw new Error("Interviewer not found");
  }

  if (!ALLOWED_INTERVIEWERS.includes(user.role)) {
    throw new Error(
      "Selected user cannot conduct interviews"
    );
  }

  return user;
};

export const validateSchedule = (
  scheduledAt
) => {
  const date = new Date(scheduledAt);

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      "Invalid interview date and time"
    );
  }

  if (date <= new Date()) {
    throw new Error(
      "Interview must be scheduled in the future"
    );
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
    throw new Error(
      "Meeting link is required for online interview"
    );
  }

  if (
    mode === INTERVIEW_MODES.ONSITE &&
    !location
  ) {
    throw new Error(
      "Location is required for onsite interview"
    );
  }
};
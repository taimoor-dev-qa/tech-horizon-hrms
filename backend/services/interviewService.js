import {
  notifyInterviewCancelled,
  notifyInterviewScheduled,
} from "./interviewNotificationService.js";

import Candidate from "../models/Candidate.js";
import Interview from "../models/Interview.js";

import {
  CANDIDATE_STATUS,
} from "../constants/recruitment.js";

import {
  INTERVIEW_STATUS,
  INTERVIEW_TYPES,
} from "../constants/interview.js";

import {
  getValidCandidate,
  validateInterviewer,
  validateModeDetails,
  validateSchedule,
} from "./interviewValidationService.js";

const EDITABLE_FIELDS = [
  "interviewer",
  "type",
  "mode",
  "scheduledAt",
  "durationMinutes",
  "location",
  "meetingLink",
];

const updateCandidateStage = async (
  candidate,
  type
) => {
  if (
    type === INTERVIEW_TYPES.TECHNICAL
  ) {
    candidate.status =
      CANDIDATE_STATUS.TECHNICAL_INTERVIEW;

    await candidate.save();

    return;
  }

  if (
    [
      CANDIDATE_STATUS.APPLIED,
      CANDIDATE_STATUS.SCREENING,
    ].includes(candidate.status)
  ) {
    candidate.status =
      CANDIDATE_STATUS.INTERVIEW;

    await candidate.save();
  }
};

export const createInterview = async (
  data,
  createdBy
) => {
  const candidate = await getValidCandidate(
    data.candidate
  );

  await validateInterviewer(
    data.interviewer
  );

  validateSchedule(data.scheduledAt);
  validateModeDetails(data);

  const interview = await Interview.create({
    ...data,
    job: candidate.job,
    createdBy,
  });

  await updateCandidateStage(
    candidate,
    data.type
  );

  await notifyInterviewScheduled(
    interview
  );

  return interview;
};

export const updateInterview = async (
  id,
  data
) => {
  const interview = await Interview.findById(
    id
  );

  if (!interview) {
    return null;
  }

  if (
    interview.status !==
    INTERVIEW_STATUS.SCHEDULED
  ) {
    throw new Error(
      "Only scheduled interviews can be edited"
    );
  }

  if (data.interviewer) {
    await validateInterviewer(
      data.interviewer
    );
  }

  if (data.scheduledAt) {
    validateSchedule(data.scheduledAt);
  }

  validateModeDetails({
    mode: data.mode || interview.mode,
    location:
      data.location ?? interview.location,
    meetingLink:
      data.meetingLink ??
      interview.meetingLink,
  });

  EDITABLE_FIELDS.forEach((field) => {
    if (Object.hasOwn(data, field)) {
      interview[field] = data[field];
    }
  });

  await interview.save();

  return interview;
};

export const cancelInterview = async (id) => {
  const interview = await Interview.findById(
    id
  );

  if (!interview) {
    return null;
  }

  if (
    interview.status !==
    INTERVIEW_STATUS.SCHEDULED
  ) {
    throw new Error(
      "Only scheduled interviews can be cancelled"
    );
  }

  interview.status =
    INTERVIEW_STATUS.CANCELLED;

  await interview.save();

  await notifyInterviewCancelled(
    interview
  );

  return interview;
};
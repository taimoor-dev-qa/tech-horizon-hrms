import Interview
  from "../models/Interview.js";

import {
  validateInterviewReadAccess,
} from "./recruitmentAccessService.js";

const populateInterview = (
  query
) => {
  return query
    .populate(
      "candidate",
      "name email phone status"
    )
    .populate(
      "job",
      "title code department designation"
    )
    .populate(
      "interviewer",
      "name email role"
    )
    .populate(
      "createdBy",
      "name email role"
    );
};

export const getInterviews =
  async ({
    candidate,
    job,
    type,
    status,
    startDate,
    endDate,
  } = {}) => {
    const filter = {};

    if (candidate) {
      filter.candidate =
        candidate;
    }

    if (job) {
      filter.job = job;
    }

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    if (
      startDate ||
      endDate
    ) {
      filter.scheduledAt = {};

      if (startDate) {
        filter.scheduledAt.$gte =
          new Date(
            `${startDate}T00:00:00Z`
          );
      }

      if (endDate) {
        filter.scheduledAt.$lte =
          new Date(
            `${endDate}T23:59:59Z`
          );
      }
    }

    return populateInterview(
      Interview.find(filter).sort({
        scheduledAt: 1,
      })
    );
  };

export const getMyInterviews =
  async (userId) => {
    return populateInterview(
      Interview.find({
        interviewer: userId,
      }).sort({
        scheduledAt: 1,
      })
    );
  };

export const getInterviewById =
  async (
    actor,
    id
  ) => {
    const interview =
      await Interview.findById(
        id
      );

    if (!interview) {
      return null;
    }

    validateInterviewReadAccess(
      actor,
      interview
    );

    return populateInterview(
      Interview.findById(id)
    );
  };
import Interview
  from "../models/Interview.js";

import {
  validateInterviewReadAccess,
} from "./recruitmentAccessService.js";

import {
  buildPagination,
  getPagination,
} from "../utils/pagination.js";

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
    page,
    limit,
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
        filter
          .scheduledAt
          .$gte =
          new Date(
            `${startDate}T00:00:00Z`
          );
      }

      if (endDate) {
        filter
          .scheduledAt
          .$lte =
          new Date(
            `${endDate}T23:59:59Z`
          );
      }
    }

    const pagination =
      getPagination({
        page,
        limit,
      });

    const [
      interviews,
      total,
    ] =
      await Promise.all([
        populateInterview(
          Interview
            .find(filter)
            .sort({
              scheduledAt: 1,
            })
            .skip(
              pagination.skip
            )
            .limit(
              pagination.limit
            )
        ),

        Interview
          .countDocuments(
            filter
          ),
      ]);

    return {
      interviews,

      pagination:
        buildPagination(
          pagination.page,
          pagination.limit,
          total
        ),
    };
  };

export const getMyInterviews =
  async (
    userId,
    {
      page,
      limit,
    } = {}
  ) => {
    const filter = {
      interviewer:
        userId,
    };

    const pagination =
      getPagination({
        page,
        limit,
      });

    const [
      interviews,
      total,
    ] =
      await Promise.all([
        populateInterview(
          Interview
            .find(filter)
            .sort({
              scheduledAt: 1,
            })
            .skip(
              pagination.skip
            )
            .limit(
              pagination.limit
            )
        ),

        Interview
          .countDocuments(
            filter
          ),
      ]);

    return {
      interviews,

      pagination:
        buildPagination(
          pagination.page,
          pagination.limit,
          total
        ),
    };
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
      Interview.findById(
        id
      )
    );
  };
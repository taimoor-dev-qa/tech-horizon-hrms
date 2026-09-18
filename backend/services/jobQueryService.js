import Job
  from "../models/Job.js";

import {
  applyJobReadAccess,
  validateJobReadAccess,
} from "./recruitmentAccessService.js";

const populateJob = (
  query
) => {
  return query
    .populate(
      "department",
      "name code"
    )
    .populate(
      "designation",
      "name code"
    )
    .populate(
      "createdBy",
      "name email role"
    );
};

export const getJobs =
  async (
    actor,
    {
      status,
      department,
      search,
    } = {}
  ) => {
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (department) {
      filter.department =
        department;
    }

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          code: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    applyJobReadAccess(
      actor,
      filter,
      status
    );

    return populateJob(
      Job.find(filter).sort({
        createdAt: -1,
      })
    );
  };

export const getJobById =
  async (
    actor,
    id
  ) => {
    const job =
      await Job.findById(id);

    if (!job) {
      return null;
    }

    validateJobReadAccess(
      actor,
      job
    );

    return populateJob(
      Job.findById(id)
    );
  };
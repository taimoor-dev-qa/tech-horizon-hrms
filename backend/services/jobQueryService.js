import Job
  from "../models/Job.js";

import {
  applyJobReadAccess,
  validateJobReadAccess,
} from "./recruitmentAccessService.js";

import {
  buildPagination,
  getPagination,
} from "../utils/pagination.js";

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
      page,
      limit,
    } = {}
  ) => {
    const filter = {};

    if (status) {
      filter.status =
        status;
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

    /*
     * Step 28C security.
     * REMOVE NAHI KARNI.
     */
    applyJobReadAccess(
      actor,
      filter,
      status
    );

    const pagination =
      getPagination({
        page,
        limit,
      });

    const [
      jobs,
      total,
    ] =
      await Promise.all([
        populateJob(
          Job.find(filter)
            .sort({
              createdAt: -1,
            })
            .skip(
              pagination.skip
            )
            .limit(
              pagination.limit
            )
        ),

        Job.countDocuments(
          filter
        ),
      ]);

    return {
      jobs,

      pagination:
        buildPagination(
          pagination.page,
          pagination.limit,
          total
        ),
    };
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
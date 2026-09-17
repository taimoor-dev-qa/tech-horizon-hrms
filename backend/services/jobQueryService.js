import Job from "../models/Job.js";

const populateJob = (query) => {
  return query
    .populate("department", "name code")
    .populate("designation", "name code")
    .populate(
      "createdBy",
      "name email role"
    );
};

export const getJobs = async ({
  status,
  department,
  search,
} = {}) => {
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (department) {
    filter.department = department;
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

  return populateJob(
    Job.find(filter).sort({
      createdAt: -1,
    })
  );
};

export const getJobById = async (id) => {
  return populateJob(
    Job.findById(id)
  );
};
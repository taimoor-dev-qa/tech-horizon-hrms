import Job from "../models/Job.js";

import {
  validateJobStructure,
} from "./jobValidationService.js";

export const createJob = async (
  data,
  userId
) => {
  const existing = await Job.findOne({
    code: data.code?.toUpperCase(),
  });

  if (existing) {
    throw new Error(
      "Job code already exists"
    );
  }

  await validateJobStructure(
    data.department,
    data.designation
  );

  return Job.create({
    ...data,
    createdBy: userId,
  });
};

export const updateJob = async (
  id,
  data
) => {
  const job = await Job.findById(id);

  if (!job) {
    return null;
  }

  const department =
    data.department || job.department;

  const designation =
    data.designation || job.designation;

  await validateJobStructure(
    department,
    designation
  );

  Object.assign(job, data);

  await job.save();

  return job;
};

export const deleteJob = async (id) => {
  return Job.findByIdAndDelete(id);
};
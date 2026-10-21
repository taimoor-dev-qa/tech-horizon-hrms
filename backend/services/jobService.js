import AppError from "../utils/AppError.js";
import Job from "../models/Job.js";

import {
  validateJobStructure,
} from "./jobValidationService.js";
import { mapDuplicateKeyError } from "../utils/mongoDuplicateKey.js";

const duplicateConstraints = [
  { fields: ["code"], message: "Job code already exists" },
];

export const createJob = async (
  data,
  userId
) => {
  const existing = await Job.findOne({
    code: data.code?.toUpperCase(),
  });

  if (existing) {
    throw new AppError("Job code already exists", 400);
  }

  await validateJobStructure(
    data.department,
    data.designation
  );

  try {
    return await Job.create({
      ...data,
      createdBy: userId,
    });
  } catch (error) {
    throw mapDuplicateKeyError(error, duplicateConstraints);
  }
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

  try {
    await job.save();
  } catch (error) {
    throw mapDuplicateKeyError(error, duplicateConstraints);
  }

  return job;
};

export const deleteJob = async (id) => {
  return Job.findByIdAndDelete(id);
};

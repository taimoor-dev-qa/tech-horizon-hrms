import AppError from "../utils/AppError.js";
import Job from "../models/Job.js";

import {
  validateJobStructure,
} from "./jobValidationService.js";
import { mapDuplicateKeyError } from "../utils/mongoDuplicateKey.js";
import {
  assertJobCanBeDeleted,
} from "./resourceReferenceService.js";
import {
  validateJobLifecycle,
} from "./recruitmentLifecycleService.js";

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

  await validateJobLifecycle(data);

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

  await validateJobLifecycle(
    data,
    job
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
  const job = await Job.findById(id);

  if (!job) {
    return null;
  }

  await assertJobCanBeDeleted(id);

  return Job.findByIdAndDelete(id);
};

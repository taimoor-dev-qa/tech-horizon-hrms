import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createJob as createService,
  deleteJob as deleteService,
  updateJob as updateService,
} from "../services/jobService.js";

import {
  getJobById as getByIdService,
  getJobs as getJobsService,
} from "../services/jobQueryService.js";

export const createJob = asyncHandler(async (req, res) => {
  const job = await createService(
    req.body,
    req.user._id
  );

  res.status(201).json({
    success: true,
    message: "Job created successfully",
    job,
  });
});

export const getJobs = asyncHandler(async (req, res) => {
  const result =
    await getJobsService(
      req.user,
      req.query
    );

  res.status(200).json({
    success: true,

    count:
      result.jobs.length,

    pagination:
      result.pagination,

    jobs:
      result.jobs,
  });
});

export const getJobById = asyncHandler(async (req, res) => {
  const job =
    await getByIdService(
      req.user,
      req.params.id
    );

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  res.status(200).json({
    success: true,
    job,
  });
});

export const updateJob = asyncHandler(async (req, res) => {
  const job = await updateService(
    req.params.id,
    req.body
  );

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Job updated successfully",
    job,
  });
});

export const deleteJob = asyncHandler(async (req, res) => {
  const job = await deleteService(
    req.params.id
  );

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Job deleted successfully",
  });
});

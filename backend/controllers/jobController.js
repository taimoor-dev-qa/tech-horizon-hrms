import {
  createJob as createService,
  deleteJob as deleteService,
  updateJob as updateService,
} from "../services/jobService.js";

import {
  getJobById as getByIdService,
  getJobs as getJobsService,
} from "../services/jobQueryService.js";

export const createJob = async (
  req,
  res
) => {
  try {
    const job = await createService(
      req.body,
      req.user._id
    );

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getJobs = async (
  req,
  res
) => {
  try {
    const jobs =
      await getJobsService(
        req.user,
        req.query
      );

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getJobById = async (
  req,
  res
) => {
  try {
    const job =
      await getByIdService(
        req.user,
        req.params.id
      );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    res.status(
      error.statusCode || 400
    ).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateJob = async (
  req,
  res
) => {
  try {
    const job = await updateService(
      req.params.id,
      req.body
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteJob = async (
  req,
  res
) => {
  try {
    const job = await deleteService(
      req.params.id
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
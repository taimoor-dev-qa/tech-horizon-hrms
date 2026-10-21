import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createProject as createProjectService,
  deleteProject as deleteProjectService,
  updateProject as updateProjectService,
} from "../services/projectService.js";

import {
  getMyProjects as getMyProjectsService,
  getProjectById as getProjectByIdService,
  getProjects as getProjectsService,
} from "../services/projectQueryService.js";

export const createProject = asyncHandler(async (req, res) => {
  const project =
    await createProjectService(
      req.body,
      req.user
    );

  res.status(201).json({
    success: true,
    message: "Project created successfully",
    project,
  });
});

export const getProjects = asyncHandler(async (req, res) => {
  const result =
    await getProjectsService(
      req.user,
      req.query
    );

  res.status(200).json({
    success: true,

    count:
      result
        .projects
        .length,

    pagination:
      result.pagination,

    projects:
      result.projects,
  });
});

export const getMyProjects = asyncHandler(async (req, res) => {
  const result =
    await getMyProjectsService(
      req.user._id,
      req.query
    );

  res.status(200).json({
    success: true,

    count:
      result
        .projects
        .length,

    pagination:
      result.pagination,

    projects:
      result.projects,
  });
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project =
    await getProjectByIdService(
      req.user,
      req.params.id
    );

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  res.status(200).json({
    success: true,
    project,
  });
});

export const updateProject = asyncHandler(async (req, res) => {

  const project =
    await updateProjectService(
      req.params.id,
      req.body,
      req.user
    );

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Project updated successfully",
    project,
  });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project =
    await deleteProjectService(
      req.params.id
    );

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Project deleted successfully",
  });
});

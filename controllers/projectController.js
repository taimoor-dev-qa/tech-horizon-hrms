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

export const createProject = async (
  req,
  res
) => {
  try {
    const project =
      await createProjectService(req.body);

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProjects = async (
  req,
  res
) => {
  try {
    const projects =
      await getProjectsService(req.query);

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyProjects = async (
  req,
  res
) => {
  try {
    const projects =
      await getMyProjectsService(
        req.user._id
      );

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProjectById = async (
  req,
  res
) => {
  try {
    const project =
      await getProjectByIdService(
        req.params.id
      );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProject = async (
  req,
  res
) => {
  try {
    const project =
      await updateProjectService(
        req.params.id,
        req.body
      );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProject = async (
  req,
  res
) => {
  try {
    const project =
      await deleteProjectService(
        req.params.id
      );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
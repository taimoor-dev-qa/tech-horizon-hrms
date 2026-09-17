import Project from "../models/Project.js";

import {
  validateProjectDates,
  validateProjectManager,
  validateProjectMembers,
} from "./projectValidationService.js";

export const createProject = async (data) => {
  const existing = await Project.findOne({
    code: data.code?.toUpperCase(),
  });

  if (existing) {
    throw new Error(
      "Project code already exists"
    );
  }

  validateProjectDates(
    data.startDate,
    data.deadline
  );

  await validateProjectManager(data.manager);

  await validateProjectMembers(
    data.members || []
  );

  return Project.create(data);
};

export const updateProject = async (
  id,
  data
) => {
  const project = await Project.findById(id);

  if (!project) {
    return null;
  }

  const startDate =
    data.startDate || project.startDate;

  const deadline =
    data.deadline || project.deadline;

  validateProjectDates(
    startDate,
    deadline
  );

  if (data.manager) {
    await validateProjectManager(data.manager);
  }

  if (data.members) {
    await validateProjectMembers(data.members);
  }

  Object.assign(project, data);

  await project.save();

  return project;
};

export const deleteProject = async (id) => {
  return Project.findByIdAndDelete(id);
};
import Project
  from "../models/Project.js";

import {
  validateProjectDates,
  validateProjectManager,
  validateProjectMembers,
} from "./projectValidationService.js";

import {
  validateProjectCreationAccess,
  validateProjectManagementAccess,
} from "./projectAccessService.js";

export const createProject =
  async (
    data,
    actor
  ) => {
    const existing =
      await Project.findOne({
        code:
          data.code?.toUpperCase(),
      });

    if (existing) {
      throw new Error(
        "Project code already exists"
      );
    }

    await validateProjectCreationAccess(
      actor,
      data.manager
    );

    validateProjectDates(
      data.startDate,
      data.deadline
    );

    await validateProjectManager(
      data.manager
    );

    await validateProjectMembers(
      data.members || []
    );

    return Project.create(
      data
    );
  };

export const updateProject =
  async (
    id,
    data,
    actor
  ) => {
    const project =
      await Project.findById(
        id
      );

    if (!project) {
      return null;
    }

    await validateProjectManagementAccess(
      actor,
      project
    );

    const startDate =
      data.startDate ||
      project.startDate;

    const deadline =
      data.deadline ||
      project.deadline;

    validateProjectDates(
      startDate,
      deadline
    );

    if (data.manager) {
      await validateProjectManager(
        data.manager
      );

      if (
        ![
          "super_admin",
          "hr_admin",
        ].includes(actor.role)
      ) {
        const currentManager =
          project.manager;

        if (
          String(data.manager) !==
          String(currentManager)
        ) {
          throw new Error(
            "Manager cannot transfer project ownership"
          );
        }
      }
    }

    if (data.members) {
      await validateProjectMembers(
        data.members
      );
    }

    Object.assign(
      project,
      data
    );

    await project.save();

    return project;
  };

export const deleteProject =
  async (id) => {
    return Project.findByIdAndDelete(
      id
    );
  };
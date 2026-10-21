import AppError from "../utils/AppError.js";
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
import { mapDuplicateKeyError } from "../utils/mongoDuplicateKey.js";

const duplicateConstraints = [
  { fields: ["code"], message: "Project code already exists" },
];

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
      throw new AppError("Project code already exists", 400);
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

    try {
      return await Project.create(
        data
      );
    } catch (error) {
      throw mapDuplicateKeyError(error, duplicateConstraints);
    }
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
          throw new AppError("Manager cannot transfer project ownership", 400);
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

    try {
      await project.save();
    } catch (error) {
      throw mapDuplicateKeyError(error, duplicateConstraints);
    }

    return project;
  };

export const deleteProject =
  async (id) => {
    return Project.findByIdAndDelete(
      id
    );
  };

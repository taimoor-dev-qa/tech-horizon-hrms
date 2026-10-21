import AppError from "../utils/AppError.js";
import Employee
  from "../models/Employee.js";

import ROLES
  from "../constants/roles.js";

const FULL_ACCESS_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN,
];

export const hasFullProjectAccess = (
  actor
) => {
  return FULL_ACCESS_ROLES.includes(
    actor.role
  );
};

export const getActorEmployee =
  async (actor) => {
    return Employee.findOne({
      user: actor._id,
    });
  };

export const getProjectAccessCondition =
  async (actor) => {
    if (
      hasFullProjectAccess(actor)
    ) {
      return null;
    }

    const employee =
      await getActorEmployee(actor);

    if (!employee) {
      return {
        _id: null,
      };
    }

    return {
      $or: [
        {
          manager:
            employee._id,
        },
        {
          members:
            employee._id,
        },
      ],
    };
  };

export const canAccessProject =
  async (
    actor,
    project
  ) => {
    if (
      hasFullProjectAccess(actor)
    ) {
      return true;
    }

    const employee =
      await getActorEmployee(actor);

    if (!employee) {
      return false;
    }

    const isManager =
      String(project.manager) ===
      String(employee._id);

    const isMember =
      project.members.some(
        (member) =>
          String(
            member._id ||
              member
          ) ===
          String(employee._id)
      );

    return (
      isManager ||
      isMember
    );
  };

export const validateProjectManagementAccess =
  async (
    actor,
    project
  ) => {
    if (
      hasFullProjectAccess(actor)
    ) {
      return true;
    }

    const employee =
      await getActorEmployee(actor);

    if (!employee) {
      throw new AppError("Employee profile not found", 400);
    }

    const isProjectManager =
      String(project.manager) ===
      String(employee._id);

    if (!isProjectManager) {
      throw new AppError("You can only manage projects assigned to you", 400);
    }

    return true;
  };

export const validateProjectCreationAccess =
  async (
    actor,
    managerId
  ) => {
    if (
      hasFullProjectAccess(actor)
    ) {
      return true;
    }

    const employee =
      await getActorEmployee(actor);

    if (!employee) {
      throw new AppError("Employee profile not found", 400);
    }

    if (
      String(employee._id) !==
      String(managerId)
    ) {
      throw new AppError("Manager can only create a project assigned to themselves", 400);
    }

    return true;
  };

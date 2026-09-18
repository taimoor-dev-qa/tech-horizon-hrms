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
      throw new Error(
        "Employee profile not found"
      );
    }

    const isProjectManager =
      String(project.manager) ===
      String(employee._id);

    if (!isProjectManager) {
      throw new Error(
        "You can only manage projects assigned to you"
      );
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
      throw new Error(
        "Employee profile not found"
      );
    }

    if (
      String(employee._id) !==
      String(managerId)
    ) {
      throw new Error(
        "Manager can only create a project assigned to themselves"
      );
    }

    return true;
  };
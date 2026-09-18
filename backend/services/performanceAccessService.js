import Employee
  from "../models/Employee.js";

import ROLES
  from "../constants/roles.js";

const ADMIN_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN,
];

export const hasFullPerformanceAccess = (
  actor
) => {
  return ADMIN_ROLES.includes(
    actor.role
  );
};

export const getAccessibleEmployeeIds =
  async (actor) => {
    if (
      hasFullPerformanceAccess(actor)
    ) {
      return null;
    }

    const employees =
      await Employee.find({
        $or: [
          {
            manager: actor._id,
          },
          {
            teamLead: actor._id,
          },
        ],
      }).select("_id");

    return employees.map(
      (employee) => employee._id
    );
  };

export const canAccessPerformanceReview =
  async (
    actor,
    review
  ) => {
    if (
      hasFullPerformanceAccess(actor)
    ) {
      return true;
    }

    if (
      String(review.reviewer) ===
      String(actor._id)
    ) {
      return true;
    }

    const employeeId =
      review.employee?._id ||
      review.employee;

    const employee =
      await Employee.findById(
        employeeId
      ).select(
        "manager teamLead"
      );

    if (!employee) {
      return false;
    }

    const isManager =
      String(
        employee.manager || ""
      ) === String(actor._id);

    const isTeamLead =
      String(
        employee.teamLead || ""
      ) === String(actor._id);

    return (
      isManager ||
      isTeamLead
    );
  };
import Employee
  from "../models/Employee.js";

import PerformanceReview
  from "../models/PerformanceReview.js";

import {
  PERFORMANCE_STATUS,
} from "../constants/performance.js";

import {
  canAccessPerformanceReview,
  getAccessibleEmployeeIds,
  hasFullPerformanceAccess,
} from "./performanceAccessService.js";

const populateReview = (
  query
) => {
  return query
    .populate({
      path: "employee",

      select:
        "employeeId user department designation",

      populate: [
        {
          path: "user",
          select: "name email",
        },

        {
          path: "department",
          select: "name code",
        },

        {
          path: "designation",
          select: "name code",
        },
      ],
    })

    .populate(
      "reviewer",
      "name email role"
    );
};

export const getPerformanceReviews =
  async (
    actor,
    {
      employee,
      status,
      periodStart,
      periodEnd,
    } = {}
  ) => {
    const filter = {};

    if (employee) {
      filter.employee = employee;
    }

    if (status) {
      filter.status = status;
    }

    if (periodStart) {
      filter.periodStart = {
        $gte: periodStart,
      };
    }

    if (periodEnd) {
      filter.periodEnd = {
        $lte: periodEnd,
      };
    }

    if (
      !hasFullPerformanceAccess(
        actor
      )
    ) {
      const employeeIds =
        await getAccessibleEmployeeIds(
          actor
        );

      if (filter.employee) {
        const allowed =
          employeeIds.some(
            (id) =>
              String(id) ===
              String(
                filter.employee
              )
          );

        if (!allowed) {
          filter._id = null;
        }
      } else {
        filter.$or = [
          {
            employee: {
              $in: employeeIds,
            },
          },

          {
            reviewer:
              actor._id,
          },
        ];
      }
    }

    return populateReview(
      PerformanceReview.find(
        filter
      ).sort({
        periodEnd: -1,
      })
    );
  };

export const getPerformanceReviewById =
  async (
    actor,
    id
  ) => {
    const review =
      await PerformanceReview.findById(
        id
      );

    if (!review) {
      return null;
    }

    const allowed =
      await canAccessPerformanceReview(
        actor,
        review
      );

    if (!allowed) {
      throw new Error(
        "You do not have access to this performance review"
      );
    }

    return populateReview(
      PerformanceReview.findById(
        id
      )
    );
  };

export const getMyPerformanceReviews =
  async (userId) => {
    const employee =
      await Employee.findOne({
        user: userId,
      });

    if (!employee) {
      throw new Error(
        "Employee profile not found"
      );
    }

    return populateReview(
      PerformanceReview.find({
        employee:
          employee._id,

        status: {
          $in: [
            PERFORMANCE_STATUS.SUBMITTED,
            PERFORMANCE_STATUS.ACKNOWLEDGED,
          ],
        },
      }).sort({
        periodEnd: -1,
      })
    );
  };
import Employee from "../models/Employee.js";
import PerformanceReview
  from "../models/PerformanceReview.js";

import {
  PERFORMANCE_STATUS,
} from "../constants/performance.js";

const populateReview = (query) => {
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
  async ({
    employee,
    status,
    periodStart,
    periodEnd,
  } = {}) => {
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
        ...(filter.periodEnd || {}),
        $lte: periodEnd,
      };
    }

    return populateReview(
      PerformanceReview.find(filter).sort({
        periodEnd: -1,
      })
    );
  };

export const getPerformanceReviewById =
  async (id) => {
    return populateReview(
      PerformanceReview.findById(id)
    );
  };

export const getMyPerformanceReviews =
  async (userId) => {
    const employee = await Employee.findOne({
      user: userId,
    });

    if (!employee) {
      throw new Error(
        "Employee profile not found"
      );
    }

    return populateReview(
      PerformanceReview.find({
        employee: employee._id,
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
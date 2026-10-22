import PerformanceReview
  from "../models/PerformanceReview.js";

import Employee from "../models/Employee.js";
import {
  getAccessibleEmployeeIds,
  hasFullEmployeeAccess,
} from "./employeeAccessService.js";

export const getPerformanceReport =
  async (
    actor,
    {
      employee,
      department,
      status,
      minScore,
      maxScore,
    } = {}
  ) => {
    const baseFilter = {};

    if (employee) {
      baseFilter.employee = employee;
    }

    if (status) {
      baseFilter.status = status;
    }

    if (
      minScore !== undefined ||
      maxScore !== undefined
    ) {
      baseFilter.overallScore = {};

      if (minScore !== undefined) {
        baseFilter.overallScore.$gte =
          Number(minScore);
      }

      if (maxScore !== undefined) {
        baseFilter.overallScore.$lte =
          Number(maxScore);
      }
    }

    if (department) {
      const employees =
        await Employee.find({
          department,
        }).select("_id");

      baseFilter.employee = {
        $in: employees.map(
          (item) => item._id
        ),
      };
    }

    const conditions = [];

    if (Object.keys(baseFilter).length) {
      conditions.push(baseFilter);
    }

    if (!hasFullEmployeeAccess(actor)) {
      const employeeIds =
        await getAccessibleEmployeeIds(actor);

      const accessConditions = [
        { reviewer: actor._id },
      ];

      if (employeeIds.length) {
        accessConditions.push({
          employee: {
            $in: employeeIds,
          },
        });
      }

      conditions.push({
        $or: accessConditions,
      });
    }

    let filter = {};

    if (conditions.length === 1) {
      [filter] = conditions;
    }

    if (conditions.length > 1) {
      filter = {
        $and: conditions,
      };
    }

    const reviews =
      await PerformanceReview.find(filter)
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
        )
        .sort({
          periodEnd: -1,
        });

    const totalScore = reviews.reduce(
      (sum, review) =>
        sum +
        Number(review.overallScore || 0),
      0
    );

    const averageScore = reviews.length
      ? Number(
          (
            totalScore /
            reviews.length
          ).toFixed(2)
        )
      : 0;

    return {
      summary: {
        totalReviews: reviews.length,
        averageScore,
      },
      reviews,
    };
  };

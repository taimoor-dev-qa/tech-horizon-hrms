import PerformanceReview
  from "../models/PerformanceReview.js";

import Employee from "../models/Employee.js";

export const getPerformanceReport =
  async ({
    employee,
    department,
    status,
    minScore,
    maxScore,
  } = {}) => {
    const filter = {};

    if (employee) {
      filter.employee = employee;
    }

    if (status) {
      filter.status = status;
    }

    if (
      minScore !== undefined ||
      maxScore !== undefined
    ) {
      filter.overallScore = {};

      if (minScore !== undefined) {
        filter.overallScore.$gte =
          Number(minScore);
      }

      if (maxScore !== undefined) {
        filter.overallScore.$lte =
          Number(maxScore);
      }
    }

    if (department) {
      const employees =
        await Employee.find({
          department,
        }).select("_id");

      filter.employee = {
        $in: employees.map(
          (item) => item._id
        ),
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
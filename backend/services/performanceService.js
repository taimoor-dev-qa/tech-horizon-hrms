import AppError from "../utils/AppError.js";
import PerformanceReview
  from "../models/PerformanceReview.js";

import {
  PERFORMANCE_STATUS,
} from "../constants/performance.js";

import {
  calculateOverallScore,
  getValidEmployee,
  validateReviewerAccess,
  validateReviewDates,
} from "./performanceValidationService.js";
import { mapDuplicateKeyError } from "../utils/mongoDuplicateKey.js";

const duplicateConstraints = [
  {
    fields: ["employee", "periodStart", "periodEnd"],
    message: "Performance review already exists for this period",
  },
];

export const createPerformanceReview =
  async (actor, data) => {
    if (!data.ratings) {
      throw new AppError("Performance ratings are required", 400);
    }

    const employee = await getValidEmployee(
      data.employee
    );

    await validateReviewerAccess(
      actor,
      employee
    );

    validateReviewDates(
      data.periodStart,
      data.periodEnd
    );

    const existing =
      await PerformanceReview.findOne({
        employee: employee._id,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
      });

    if (existing) {
      throw new AppError("Performance review already exists for this period", 400);
    }

    const overallScore =
      calculateOverallScore(data.ratings);

    try {
      return await PerformanceReview.create({
        ...data,
        employee: employee._id,
        reviewer: actor._id,
        overallScore,
      });
    } catch (error) {
      throw mapDuplicateKeyError(error, duplicateConstraints);
    }
  };

export const updatePerformanceReview =
  async (actor, id, data) => {
    const review =
      await PerformanceReview.findById(id);

    if (!review) {
      return null;
    }

    if (
      review.status !==
      PERFORMANCE_STATUS.DRAFT
    ) {
      throw new AppError("Only draft reviews can be edited", 400);
    }

    const employee = await getValidEmployee(
      review.employee
    );

    await validateReviewerAccess(
      actor,
      employee
    );

    if (
      String(review.reviewer) !==
        String(actor._id) &&
      !["super_admin", "hr_admin"].includes(
        actor.role
      )
    ) {
      throw new AppError("Only the review creator can edit this review", 400);
    }

    const periodStart =
      data.periodStart || review.periodStart;

    const periodEnd =
      data.periodEnd || review.periodEnd;

    validateReviewDates(
      periodStart,
      periodEnd
    );

    if (data.ratings) {
      review.ratings = data.ratings;

      review.overallScore =
        calculateOverallScore(
          data.ratings
        );
    }

    const editableFields = [
      "periodStart",
      "periodEnd",
      "strengths",
      "improvements",
      "goals",
      "reviewerComment",
    ];

    editableFields.forEach((field) => {
      if (Object.hasOwn(data, field)) {
        review[field] = data[field];
      }
    });

    try {
      await review.save();
    } catch (error) {
      throw mapDuplicateKeyError(error, duplicateConstraints);
    }

    return review;
  };

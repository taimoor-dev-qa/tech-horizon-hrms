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

export const createPerformanceReview =
  async (actor, data) => {
    if (!data.ratings) {
      throw new Error(
        "Performance ratings are required"
      );
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
      throw new Error(
        "Performance review already exists for this period"
      );
    }

    const overallScore =
      calculateOverallScore(data.ratings);

    return PerformanceReview.create({
      ...data,
      employee: employee._id,
      reviewer: actor._id,
      overallScore,
    });
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
      throw new Error(
        "Only draft reviews can be edited"
      );
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
      throw new Error(
        "Only the review creator can edit this review"
      );
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

    await review.save();

    return review;
  };
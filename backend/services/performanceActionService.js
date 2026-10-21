import AppError from "../utils/AppError.js";
import {
  notifyPerformanceSubmitted,
} from "./performanceNotificationService.js";

import Employee from "../models/Employee.js";
import PerformanceReview
  from "../models/PerformanceReview.js";

import {
  PERFORMANCE_STATUS,
} from "../constants/performance.js";

export const submitPerformanceReview =
  async (id, actor) => {
    const review =
      await PerformanceReview.findById(id);

    if (!review) {
      throw new AppError("Performance review not found", 400);
    }

    if (
      review.status !==
      PERFORMANCE_STATUS.DRAFT
    ) {
      throw new AppError("Only draft reviews can be submitted", 400);
    }

    const hasAdminAccess = [
      "super_admin",
      "hr_admin",
    ].includes(actor.role);

    if (
      String(review.reviewer) !==
      String(actor._id) &&
      !hasAdminAccess
    ) {
      throw new AppError("You cannot submit this review", 400);
    }

    review.status =
      PERFORMANCE_STATUS.SUBMITTED;

    review.submittedAt =
      new Date();

    await review.save();

    await notifyPerformanceSubmitted(
      review
    );

    return review;
  };

export const acknowledgePerformanceReview =
  async (
    id,
    userId,
    employeeComment = ""
  ) => {
    const employee = await Employee.findOne({
      user: userId,
    });

    if (!employee) {
      throw new AppError("Employee profile not found", 400);
    }

    const review =
      await PerformanceReview.findById(id);

    if (!review) {
      throw new AppError("Performance review not found", 400);
    }

    if (
      String(review.employee) !==
      String(employee._id)
    ) {
      throw new AppError("This performance review does not belong to you", 400);
    }

    if (
      review.status !==
      PERFORMANCE_STATUS.SUBMITTED
    ) {
      throw new AppError("Review is not awaiting acknowledgement", 400);
    }

    review.employeeComment =
      employeeComment;

    review.status =
      PERFORMANCE_STATUS.ACKNOWLEDGED;

    review.acknowledgedAt = new Date();

    await review.save();

    return review;
  };

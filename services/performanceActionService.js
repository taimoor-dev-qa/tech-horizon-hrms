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
      throw new Error(
        "Performance review not found"
      );
    }

    if (
      review.status !==
      PERFORMANCE_STATUS.DRAFT
    ) {
      throw new Error(
        "Only draft reviews can be submitted"
      );
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
      throw new Error(
        "You cannot submit this review"
      );
    }

    review.status =
      PERFORMANCE_STATUS.SUBMITTED;

    review.submittedAt = new Date();

    await review.save();

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
      throw new Error(
        "Employee profile not found"
      );
    }

    const review =
      await PerformanceReview.findById(id);

    if (!review) {
      throw new Error(
        "Performance review not found"
      );
    }

    if (
      String(review.employee) !==
      String(employee._id)
    ) {
      throw new Error(
        "This performance review does not belong to you"
      );
    }

    if (
      review.status !==
      PERFORMANCE_STATUS.SUBMITTED
    ) {
      throw new Error(
        "Review is not awaiting acknowledgement"
      );
    }

    review.employeeComment =
      employeeComment;

    review.status =
      PERFORMANCE_STATUS.ACKNOWLEDGED;

    review.acknowledgedAt = new Date();

    await review.save();

    return review;
  };
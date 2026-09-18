import Employee
  from "../models/Employee.js";

import {
  NOTIFICATION_TYPE,
} from "../constants/notification.js";

import {
  createNotification,
} from "./notificationService.js";

const safelyNotify = async (
  data
) => {
  try {
    return await createNotification(
      data
    );
  } catch (error) {
    console.error(
      `Performance notification error: ${error.message}`
    );

    return null;
  }
};

const getEmployeeUserId =
  async (review) => {
    const employeeId =
      review.employee?._id ||
      review.employee;

    const employee =
      await Employee.findById(
        employeeId
      ).select("user");

    return employee?.user || null;
  };

export const notifyPerformanceSubmitted =
  async (review) => {
    const recipient =
      await getEmployeeUserId(
        review
      );

    if (!recipient) {
      return;
    }

    await safelyNotify({
      recipient,

      type:
        NOTIFICATION_TYPE.PERFORMANCE,

      title:
        "Performance review submitted",

      message:
        "Your performance review has been submitted and is ready for acknowledgement.",

      referenceId:
        review._id,

      referenceType:
        "PerformanceReview",
    });
  };
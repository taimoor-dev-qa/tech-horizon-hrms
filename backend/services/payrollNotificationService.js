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
      `Payroll notification error: ${error.message}`
    );

    return null;
  }
};

const getEmployeeUserId =
  async (payroll) => {
    const employeeId =
      payroll.employee?._id ||
      payroll.employee;

    const employee =
      await Employee.findById(
        employeeId
      ).select("user");

    return employee?.user || null;
  };

export const notifyPayrollGenerated =
  async (payroll) => {
    const recipient =
      await getEmployeeUserId(
        payroll
      );

    if (!recipient) {
      return;
    }

    await safelyNotify({
      recipient,

      type:
        NOTIFICATION_TYPE.PAYROLL,

      title:
        "Payroll generated",

      message:
        `Your payroll for ${payroll.month} has been generated.`,

      referenceId:
        payroll._id,

      referenceType:
        "Payroll",
    });
  };

export const notifyPayrollPaid =
  async (payroll) => {
    const recipient =
      await getEmployeeUserId(
        payroll
      );

    if (!recipient) {
      return;
    }

    await safelyNotify({
      recipient,

      type:
        NOTIFICATION_TYPE.PAYROLL,

      title:
        "Payroll paid",

      message:
        `Your payroll for ${payroll.month} has been marked as paid.`,

      referenceId:
        payroll._id,

      referenceType:
        "Payroll",
    });
  };
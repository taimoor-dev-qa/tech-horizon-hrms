import Employee
  from "../models/Employee.js";

import User
  from "../models/User.js";

import {
  LEAVE_STATUS,
} from "../constants/leave.js";

import {
  NOTIFICATION_TYPE,
} from "../constants/notification.js";

import ROLES
  from "../constants/roles.js";

import {
  createBulkNotifications,
  createNotification,
} from "./notificationService.js";

const safely = async (
  callback
) => {
  try {
    return await callback();
  } catch (error) {
    console.error(
      `Leave notification error: ${error.message}`
    );

    return null;
  }
};

const getEmployeeUser =
  async (leave) => {
    const employeeId =
      leave.employee?._id ||
      leave.employee;

    return Employee.findById(
      employeeId
    ).select(
      "user employeeId"
    );
  };

const getHrRecipients =
  async () => {
    const users =
      await User.find({
        isActive: true,

        role: {
          $in: [
            ROLES.HR_ADMIN,
            ROLES.SUPER_ADMIN,
          ],
        },
      }).select("_id");

    return users.map(
      (user) => user._id
    );
  };

export const notifyLeaveApprover =
  async (
    leave,
    employee,
    status
  ) => {
    if (
      status ===
      LEAVE_STATUS.PENDING_MANAGER
    ) {
      if (!employee.manager) {
        return;
      }

      await safely(() =>
        createNotification({
          recipient:
            employee.manager,

          type:
            NOTIFICATION_TYPE.LEAVE,

          title:
            "Leave approval required",

          message:
            `${employee.employeeId} submitted a leave request.`,

          referenceId:
            leave._id,

          referenceType:
            "LeaveRequest",
        })
      );

      return;
    }

    if (
      status ===
      LEAVE_STATUS.PENDING_HR
    ) {
      const recipients =
        await getHrRecipients();

      await safely(() =>
        createBulkNotifications(
          recipients,
          {
            type:
              NOTIFICATION_TYPE.LEAVE,

            title:
              "HR leave approval required",

            message:
              `${employee.employeeId} has a leave request awaiting HR approval.`,

            referenceId:
              leave._id,

            referenceType:
              "LeaveRequest",
          }
        )
      );
    }
  };

export const notifyEmployeeLeaveApproved =
  async (leave) => {
    const employee =
      await getEmployeeUser(leave);

    if (!employee?.user) {
      return;
    }

    await safely(() =>
      createNotification({
        recipient:
          employee.user,

        type:
          NOTIFICATION_TYPE.LEAVE,

        title:
          "Leave approved",

        message:
          "Your leave request has been approved.",

        referenceId:
          leave._id,

        referenceType:
          "LeaveRequest",
      })
    );
  };

export const notifyEmployeeLeaveRejected =
  async (
    leave,
    reviewer
  ) => {
    const employee =
      await getEmployeeUser(leave);

    if (!employee?.user) {
      return;
    }

    await safely(() =>
      createNotification({
        recipient:
          employee.user,

        type:
          NOTIFICATION_TYPE.LEAVE,

        title:
          "Leave rejected",

        message:
          `Your leave request was rejected by ${reviewer}.`,

        referenceId:
          leave._id,

        referenceType:
          "LeaveRequest",
      })
    );
  };

export const notifyEmployeeManagerApproved =
  async (leave) => {
    const employee =
      await getEmployeeUser(leave);

    if (!employee?.user) {
      return;
    }

    await safely(() =>
      createNotification({
        recipient:
          employee.user,

        type:
          NOTIFICATION_TYPE.LEAVE,

        title:
          "Manager approved leave",

        message:
          "Your manager approved your leave request. It is now awaiting HR approval.",

        referenceId:
          leave._id,

        referenceType:
          "LeaveRequest",
      })
    );
  };
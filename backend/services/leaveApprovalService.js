import AppError from "../utils/AppError.js";
import LeaveRequest
  from "../models/LeaveRequest.js";

import {
  LEAVE_STATUS,
} from "../constants/leave.js";

import ROLES
  from "../constants/roles.js";

import {
  deductApprovedLeave,
} from "./leaveBalanceService.js";

import {
  markLeaveAttendance,
} from "./leaveAttendanceService.js";

import {
  getRuntimeCompanySettings,
} from "./companySettingsRuntimeService.js";

import {
  notifyEmployeeLeaveApproved,
  notifyEmployeeLeaveRejected,
  notifyEmployeeManagerApproved,
  notifyLeaveApprover,
} from "./leaveNotificationService.js";

import runTransaction
  from "../utils/runTransaction.js";

const validateDecision = (
  decision
) => {
  if (
    ![
      "approve",
      "reject",
    ].includes(decision)
  ) {
    throw new AppError("Decision must be approve or reject", 400);
  }
};

const finalizeApprovedLeaveInSession =
  async (
    leave,
    session
  ) => {
    await deductApprovedLeave(
      leave,
      session
    );

    await markLeaveAttendance(
      leave,
      session
    );

    leave.status =
      LEAVE_STATUS.APPROVED;

    await leave.save({
      session,
    });

    return leave;
  };

export const finalizeApprovedLeave =
  async (leave) => {
    const approvedLeave =
      await runTransaction(
        async (session) => {
          leave.$session(
            session
          );

          return finalizeApprovedLeaveInSession(
            leave,
            session
          );
        }
      );

    // Notification DB transaction
    // commit hone ke BAAD.
    await notifyEmployeeLeaveApproved(
      approvedLeave
    );

    return approvedLeave;
  };

export const managerDecision =
  async (
    leaveId,
    actor,
    decision,
    comment = ""
  ) => {
    validateDecision(
      decision
    );

    const settings =
      decision === "approve"
        ? await getRuntimeCompanySettings()
        : null;

    let outcome = "";

    const leave =
      await runTransaction(
        async (session) => {
          const currentLeave =
            await LeaveRequest
              .findById(
                leaveId
              )
              .populate(
                "employee"
              )
              .session(
                session
              );

          if (!currentLeave) {
            throw new AppError("Leave request not found", 400);
          }

          if (
            currentLeave.status !==
            LEAVE_STATUS
              .PENDING_MANAGER
          ) {
            throw new AppError("Leave is not pending manager approval", 400);
          }

          const isSuperAdmin =
            actor.role ===
            ROLES.SUPER_ADMIN;

          const isAssignedManager =
            String(
              currentLeave
                .employee
                .manager
            ) ===
            String(actor._id);

          if (
            !isSuperAdmin &&
            !isAssignedManager
          ) {
            throw new AppError("You are not this employee's manager", 400);
          }

          currentLeave
            .managerComment =
            comment;

          currentLeave
            .managerReviewedBy =
            actor._id;

          currentLeave
            .managerReviewedAt =
            new Date();

          if (
            decision === "reject"
          ) {
            currentLeave.status =
              LEAVE_STATUS
                .REJECTED;

            await currentLeave.save({
              session,
            });

            outcome =
              "manager_rejected";

            return currentLeave;
          }

          if (
            settings.leave
              .hrApprovalRequired
          ) {
            currentLeave.status =
              LEAVE_STATUS
                .PENDING_HR;

            await currentLeave.save({
              session,
            });

            outcome =
              "pending_hr";

            return currentLeave;
          }

          outcome =
            "approved";

          return finalizeApprovedLeaveInSession(
            currentLeave,
            session
          );
        }
      );

    /*
     * Notifications transaction ke
     * bahar hain.
     *
     * Notification fail ho to
     * approved/rejected leave
     * rollback nahi hogi.
     */

    if (
      outcome ===
      "manager_rejected"
    ) {
      await notifyEmployeeLeaveRejected(
        leave,
        "manager"
      );
    }

    if (
      outcome ===
      "pending_hr"
    ) {
      await notifyEmployeeManagerApproved(
        leave
      );

      await notifyLeaveApprover(
        leave,
        leave.employee,
        LEAVE_STATUS.PENDING_HR
      );
    }

    if (
      outcome ===
      "approved"
    ) {
      await notifyEmployeeLeaveApproved(
        leave
      );
    }

    return leave;
  };

export const hrDecision =
  async (
    leaveId,
    actor,
    decision,
    comment = ""
  ) => {
    validateDecision(
      decision
    );

    let outcome = "";

    const leave =
      await runTransaction(
        async (session) => {
          const currentLeave =
            await LeaveRequest
              .findById(
                leaveId
              )
              .session(
                session
              );

          if (!currentLeave) {
            throw new AppError("Leave request not found", 400);
          }

          if (
            currentLeave.status !==
            LEAVE_STATUS
              .PENDING_HR
          ) {
            throw new AppError("Leave is not pending HR approval", 400);
          }

          currentLeave.hrComment =
            comment;

          currentLeave.hrReviewedBy =
            actor._id;

          currentLeave.hrReviewedAt =
            new Date();

          if (
            decision === "reject"
          ) {
            currentLeave.status =
              LEAVE_STATUS
                .REJECTED;

            await currentLeave.save({
              session,
            });

            outcome =
              "hr_rejected";

            return currentLeave;
          }

          outcome =
            "approved";

          return finalizeApprovedLeaveInSession(
            currentLeave,
            session
          );
        }
      );

    if (
      outcome ===
      "hr_rejected"
    ) {
      await notifyEmployeeLeaveRejected(
        leave,
        "HR"
      );
    }

    if (
      outcome ===
      "approved"
    ) {
      await notifyEmployeeLeaveApproved(
        leave
      );
    }

    return leave;
  };

import {
    notifyEmployeeLeaveApproved,
    notifyEmployeeLeaveRejected,
    notifyEmployeeManagerApproved,
    notifyLeaveApprover,
} from "./leaveNotificationService.js";

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

const validateDecision = (
    decision
) => {
    if (
        ![
            "approve",
            "reject",
        ].includes(decision)
    ) {
        throw new Error(
            "Decision must be approve or reject"
        );
    }
};

export const finalizeApprovedLeave =
    async (leave) => {
        await deductApprovedLeave(
            leave
        );

        await markLeaveAttendance(
            leave
        );

        leave.status =
            LEAVE_STATUS.APPROVED;

        await leave.save();

        await notifyEmployeeLeaveApproved(
            leave
        );

        return leave;
    };

export const managerDecision =
    async (
        leaveId,
        actor,
        decision,
        comment = ""
    ) => {
        validateDecision(decision);

        const leave =
            await LeaveRequest.findById(
                leaveId
            ).populate("employee");

        if (!leave) {
            throw new Error(
                "Leave request not found"
            );
        }

        if (
            leave.status !==
            LEAVE_STATUS.PENDING_MANAGER
        ) {
            throw new Error(
                "Leave is not pending manager approval"
            );
        }

        const isSuperAdmin =
            actor.role ===
            ROLES.SUPER_ADMIN;

        const isAssignedManager =
            String(
                leave.employee.manager
            ) === String(actor._id);

        if (
            !isSuperAdmin &&
            !isAssignedManager
        ) {
            throw new Error(
                "You are not this employee's manager"
            );
        }

        leave.managerComment =
            comment;

        leave.managerReviewedBy =
            actor._id;

        leave.managerReviewedAt =
            new Date();

        if (
            decision === "reject"
        ) {
            leave.status =
                LEAVE_STATUS.REJECTED;

            await leave.save();

            await notifyEmployeeLeaveRejected(
                leave,
                "manager"
            );

            return leave;
        }

        const settings =
            await getRuntimeCompanySettings();

        if (
            settings.leave
                .hrApprovalRequired
        ) {
            leave.status =
                LEAVE_STATUS.PENDING_HR;

            await leave.save();

            await notifyEmployeeManagerApproved(
                leave
            );

            await notifyLeaveApprover(
                leave,
                leave.employee,
                LEAVE_STATUS.PENDING_HR
            );

            return leave;
        }

        return finalizeApprovedLeave(
            leave
        );
    };

export const hrDecision =
    async (
        leaveId,
        actor,
        decision,
        comment = ""
    ) => {
        validateDecision(decision);

        const leave =
            await LeaveRequest.findById(
                leaveId
            );

        if (!leave) {
            throw new Error(
                "Leave request not found"
            );
        }

        if (
            leave.status !==
            LEAVE_STATUS.PENDING_HR
        ) {
            throw new Error(
                "Leave is not pending HR approval"
            );
        }

        leave.hrComment = comment;

        leave.hrReviewedBy =
            actor._id;

        leave.hrReviewedAt =
            new Date();

        if (
            decision === "reject"
        ) {
            leave.status =
                LEAVE_STATUS.REJECTED;

            await leave.save();

            await notifyEmployeeLeaveRejected(
                leave,
                "HR"
            );

            return leave;
        }

        return finalizeApprovedLeave(
            leave
        );
    };
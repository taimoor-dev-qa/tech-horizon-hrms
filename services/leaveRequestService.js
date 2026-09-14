import Employee from "../models/Employee.js";
import LeaveRequest from "../models/LeaveRequest.js";
import LeaveType from "../models/LeaveType.js";


import {
    getHolidayDates,
} from "./holidayQueryService.js";
import {
    LEAVE_STATUS,
} from "../constants/leave.js";

import {
    validateRequestBalance,
} from "./leaveBalanceService.js";

import {
    calculateWorkingDays,
} from "./leaveDateService.js";

const getEmployee = async (userId) => {
    const employee = await Employee.findOne({
        user: userId,
    }).populate("shift");

    if (!employee) {
        throw new Error(
            "Employee profile not found"
        );
    }

    if (!employee.shift) {
        throw new Error(
            "Employee does not have a shift assigned"
        );
    }

    return employee;
};

const checkOverlap = async (
    employeeId,
    startDate,
    endDate
) => {
    const existing = await LeaveRequest.findOne({
        employee: employeeId,
        status: {
            $nin: ["rejected", "cancelled"],
        },
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
    });

    if (existing) {
        throw new Error(
            "Leave request overlaps with an existing request"
        );
    }
};

export const createLeaveRequest = async (
    userId,
    data
) => {
    const employee = await getEmployee(userId);

    const leaveType = await LeaveType.findById(
        data.leaveType
    );

    if (!leaveType || !leaveType.isActive) {
        throw new Error(
            "Leave type not found or inactive"
        );
    }

    await checkOverlap(
        employee._id,
        data.startDate,
        data.endDate
    );

    const holidayDates =
        await getHolidayDates(
            data.startDate,
            data.endDate
        );

    const totalDays = calculateWorkingDays(
        data.startDate,
        data.endDate,
        employee.shift.workingDays,
        holidayDates
    );
    await validateRequestBalance(
        employee._id,
        leaveType,
        totalDays,
        data.startDate
    );

    if (totalDays < 1) {
        throw new Error(
            "Selected dates contain no working days"
        );
    }

    return LeaveRequest.create({
        employee: employee._id,
        leaveType: leaveType._id,
        startDate: data.startDate,
        endDate: data.endDate,
        totalDays,
        reason: data.reason,

        status: employee.manager
            ? LEAVE_STATUS.PENDING_MANAGER
            : LEAVE_STATUS.PENDING_HR,
    });
};

export const getMyLeaveRequests = async (
    userId
) => {
    const employee = await getEmployee(userId);

    return LeaveRequest.find({
        employee: employee._id,
    })
        .populate(
            "leaveType",
            "name code isPaid"
        )
        .sort({ createdAt: -1 });
};
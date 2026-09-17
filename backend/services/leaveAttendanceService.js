import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

import {
    getHolidayDates,
} from "./holidayQueryService.js";

import {
    ATTENDANCE_STATUS,
} from "../constants/attendance.js";

import {
    getWorkingDates,
} from "./leaveDateService.js";

export const markLeaveAttendance = async (
    leave
) => {
    const employee = await Employee.findById(
        leave.employee
    ).populate("shift");

    if (!employee?.shift) {
        throw new Error(
            "Employee shift not found"
        );
    }


    const holidayDates =
        await getHolidayDates(
            leave.startDate,
            leave.endDate
        );

    const dates = getWorkingDates(
        leave.startDate,
        leave.endDate,
        employee.shift.workingDays,
        holidayDates
    );

    for (const attendanceDate of dates) {
        const existing = await Attendance.findOne({
            employee: employee._id,
            attendanceDate,
        });

        if (
            existing?.checkIn ||
            existing?.checkOut
        ) {
            throw new Error(
                `Attendance already exists for ${attendanceDate}`
            );
        }

        await Attendance.findOneAndUpdate(
            {
                employee: employee._id,
                attendanceDate,
            },
            {
                employee: employee._id,
                shift: employee.shift._id,
                attendanceDate,
                status: ATTENDANCE_STATUS.ON_LEAVE,
                notes: "Approved leave",
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
            }
        );
    }
};
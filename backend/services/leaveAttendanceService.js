import AppError from "../utils/AppError.js";
import Attendance
  from "../models/Attendance.js";

import Employee
  from "../models/Employee.js";

import {
  getHolidayDates,
} from "./holidayQueryService.js";

import {
  ATTENDANCE_STATUS,
} from "../constants/attendance.js";

import {
  getWorkingDates,
} from "./leaveDateService.js";
import { mapDuplicateKeyError } from "../utils/mongoDuplicateKey.js";

export const markLeaveAttendance =
  async (
    leave,
    session = null
  ) => {
    const employeeId =
      leave.employee?._id ||
      leave.employee;

    let employeeQuery =
      Employee.findById(
        employeeId
      ).populate("shift");

    if (session) {
      employeeQuery =
        employeeQuery.session(
          session
        );
    }

    const employee =
      await employeeQuery;

    if (!employee?.shift) {
      throw new AppError("Employee shift not found", 400);
    }

    const holidayDates =
      await getHolidayDates(
        leave.startDate,
        leave.endDate
      );

    const dates =
      getWorkingDates(
        leave.startDate,
        leave.endDate,
        employee.shift
          .workingDays,
        holidayDates
      );

    for (
      const attendanceDate
      of dates
    ) {
      let existingQuery =
        Attendance.findOne({
          employee:
            employee._id,

          attendanceDate,
        });

      if (session) {
        existingQuery =
          existingQuery.session(
            session
          );
      }

      const existing =
        await existingQuery;

      if (
        existing?.checkIn ||
        existing?.checkOut
      ) {
        throw new AppError(`Attendance already exists for ${attendanceDate}`, 400);
      }

      const options = {
        upsert: true,
        new: true,
        runValidators: true,
      };

      if (session) {
        options.session =
          session;
      }

      try {
        await Attendance
          .findOneAndUpdate(
            {
              employee:
                employee._id,

              attendanceDate,
            },

            {
              employee:
                employee._id,

              shift:
                employee.shift._id,

              attendanceDate,

              status:
                ATTENDANCE_STATUS
                  .ON_LEAVE,

              notes:
                "Approved leave",
            },

            options
          );
      } catch (error) {
        throw mapDuplicateKeyError(
          error,
          [
            {
              fields: ["employee", "attendanceDate"],
              message: `Attendance already exists for ${attendanceDate}`,
            },
          ]
        );
      }
    }
  };

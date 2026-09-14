import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

import {
  validateDateRange,
} from "./reportValidationService.js";

export const getAttendanceReport = async ({
  startDate,
  endDate,
  employee,
  department,
  status,
} = {}) => {
  validateDateRange(
    startDate,
    endDate
  );

  const filter = {};

  if (startDate && endDate) {
    filter.attendanceDate = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  if (employee) {
    filter.employee = employee;
  }

  if (status) {
    filter.status = status;
  }

  if (department) {
    const employees =
      await Employee.find({
        department,
      }).select("_id");

    filter.employee = {
      $in: employees.map(
        (item) => item._id
      ),
    };
  }

  const records = await Attendance.find(
    filter
  )
    .populate({
      path: "employee",
      select:
        "employeeId user department designation",
      populate: [
        {
          path: "user",
          select: "name email",
        },
        {
          path: "department",
          select: "name code",
        },
        {
          path: "designation",
          select: "name code",
        },
      ],
    })
    .populate(
      "shift",
      "name code startTime endTime"
    )
    .sort({
      attendanceDate: -1,
    });

  const summary = {
    total: records.length,
    present: 0,
    late: 0,
    absent: 0,
    halfDay: 0,
    onLeave: 0,
    workFromHome: 0,
  };

  records.forEach((record) => {
    if (record.status === "present") {
      summary.present += 1;
    }

    if (record.status === "late") {
      summary.late += 1;
    }

    if (record.status === "absent") {
      summary.absent += 1;
    }

    if (record.status === "half_day") {
      summary.halfDay += 1;
    }

    if (record.status === "on_leave") {
      summary.onLeave += 1;
    }

    if (
      record.status === "work_from_home"
    ) {
      summary.workFromHome += 1;
    }
  });

  return {
    summary,
    records,
  };
};
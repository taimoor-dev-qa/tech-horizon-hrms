import Timesheet from "../models/Timesheet.js";

import {
  getEmployeeByUser,
} from "./timesheetValidationService.js";

const populateTimesheet = (query) => {
  return query
    .populate(
      "project",
      "name code client status"
    )
    .populate({
      path: "employee",
      select: "employeeId user",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate(
      "reviewedBy",
      "name email role"
    );
};

export const getMyTimesheets = async (
  userId,
  {
    project,
    status,
    startDate,
    endDate,
  } = {}
) => {
  const employee = await getEmployeeByUser(
    userId
  );

  const filter = {
    employee: employee._id,
  };

  if (project) {
    filter.project = project;
  }

  if (status) {
    filter.status = status;
  }

  if (startDate || endDate) {
    filter.workDate = {};

    if (startDate) {
      filter.workDate.$gte = startDate;
    }

    if (endDate) {
      filter.workDate.$lte = endDate;
    }
  }

  return populateTimesheet(
    Timesheet.find(filter).sort({
      workDate: -1,
      createdAt: -1,
    })
  );
};

export const getTimesheetById = async (
  id
) => {
  return populateTimesheet(
    Timesheet.findById(id)
  );
};
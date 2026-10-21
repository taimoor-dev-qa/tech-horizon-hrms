import AppError from "../utils/AppError.js";
import Timesheet from "../models/Timesheet.js";

import {
  TIMESHEET_STATUS,
} from "../constants/timesheet.js";

import {
  getEmployeeByUser,
  validateDailyHours,
  validateProjectAccess,
  validateWorkDate,
} from "./timesheetValidationService.js";

export const createTimesheet = async (
  userId,
  data
) => {
  const employee = await getEmployeeByUser(
    userId
  );

  validateWorkDate(data.workDate);

  await validateProjectAccess(
    employee._id,
    data.project
  );

  await validateDailyHours(
    employee._id,
    data.workDate,
    data.hours
  );

  return Timesheet.create({
    employee: employee._id,
    project: data.project,
    workDate: data.workDate,
    task: data.task,
    hours: data.hours,
    description: data.description,
  });
};

export const updateTimesheet = async (
  userId,
  timesheetId,
  data
) => {
  const employee = await getEmployeeByUser(
    userId
  );

  const timesheet = await Timesheet.findById(
    timesheetId
  );

  if (!timesheet) {
    return null;
  }

  if (
    String(timesheet.employee) !==
    String(employee._id)
  ) {
    throw new AppError("You cannot edit this timesheet", 400);
  }

  if (
    timesheet.status !==
    TIMESHEET_STATUS.PENDING
  ) {
    throw new AppError("Only pending timesheets can be edited", 400);
  }

  const workDate =
    data.workDate || timesheet.workDate;

  const project =
    data.project || timesheet.project;

  const hours =
    data.hours ?? timesheet.hours;

  validateWorkDate(workDate);

  await validateProjectAccess(
    employee._id,
    project
  );

  await validateDailyHours(
    employee._id,
    workDate,
    hours,
    timesheet._id
  );

  Object.assign(timesheet, {
    ...data,
    workDate,
    project,
    hours,
  });

  await timesheet.save();

  return timesheet;
};

export const deleteTimesheet = async (
  userId,
  timesheetId
) => {
  const employee = await getEmployeeByUser(
    userId
  );

  const timesheet = await Timesheet.findById(
    timesheetId
  );

  if (!timesheet) {
    return null;
  }

  if (
    String(timesheet.employee) !==
    String(employee._id)
  ) {
    throw new AppError("You cannot delete this timesheet", 400);
  }

  if (
    timesheet.status !==
    TIMESHEET_STATUS.PENDING
  ) {
    throw new AppError("Only pending timesheets can be deleted", 400);
  }

  return Timesheet.findByIdAndDelete(
    timesheetId
  );
};

import Employee from "../models/Employee.js";
import Timesheet from "../models/Timesheet.js";

import {
  TIMESHEET_STATUS,
} from "../constants/timesheet.js";

const validateDecision = (decision) => {
  if (!["approve", "reject"].includes(decision)) {
    throw new Error(
      "Decision must be approve or reject"
    );
  }
};

export const reviewTimesheet = async (
  id,
  actor,
  decision,
  comment = ""
) => {
  validateDecision(decision);

  const manager = await Employee.findOne({
    user: actor._id,
  });

  if (!manager) {
    throw new Error(
      "Manager employee profile not found"
    );
  }

  const timesheet = await Timesheet.findById(
    id
  ).populate("project");

  if (!timesheet) {
    throw new Error("Timesheet not found");
  }

  if (
    timesheet.status !==
    TIMESHEET_STATUS.PENDING
  ) {
    throw new Error(
      "Timesheet has already been reviewed"
    );
  }

  const isProjectManager =
    String(timesheet.project.manager) ===
    String(manager._id);

  const isSuperAdmin =
    actor.role === "super_admin";

  if (!isProjectManager && !isSuperAdmin) {
    throw new Error(
      "Only the project manager can review this timesheet"
    );
  }

  timesheet.status =
    decision === "approve"
      ? TIMESHEET_STATUS.APPROVED
      : TIMESHEET_STATUS.REJECTED;

  timesheet.managerComment = comment;
  timesheet.reviewedBy = actor._id;
  timesheet.reviewedAt = new Date();

  await timesheet.save();

  return timesheet;
};

export const getManagerPendingTimesheets =
  async (userId) => {
    const manager = await Employee.findOne({
      user: userId,
    });

    if (!manager) {
      throw new Error(
        "Manager employee profile not found"
      );
    }

    return Timesheet.find({
      status: TIMESHEET_STATUS.PENDING,
    })
      .populate({
        path: "project",
        match: {
          manager: manager._id,
        },
        select: "name code manager",
      })
      .populate({
        path: "employee",
        select: "employeeId user",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ workDate: 1 })
      .then((records) =>
        records.filter(
          (record) => record.project
        )
      );
  };
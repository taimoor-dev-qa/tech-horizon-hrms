import AppError from "../utils/AppError.js";
import Employee
  from "../models/Employee.js";

import Project
  from "../models/Project.js";

import Timesheet
  from "../models/Timesheet.js";

import {
  TIMESHEET_STATUS,
} from "../constants/timesheet.js";

import ROLES
  from "../constants/roles.js";

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

const populateTimesheets = (
  query
) => {
  return query
    .populate(
      "project",
      "name code manager"
    )

    .populate({
      path: "employee",

      select:
        "employeeId user",

      populate: {
        path: "user",
        select:
          "name email",
      },
    })

    .populate(
      "reviewedBy",
      "name email role"
    );
};

export const reviewTimesheet =
  async (
    id,
    actor,
    decision,
    comment = ""
  ) => {
    validateDecision(decision);

    const timesheet =
      await Timesheet.findById(
        id
      ).populate("project");

    if (!timesheet) {
      throw new AppError("Timesheet not found", 400);
    }

    if (
      timesheet.status !==
      TIMESHEET_STATUS.PENDING
    ) {
      throw new AppError("Timesheet has already been reviewed", 400);
    }

    if (!timesheet.project) {
      throw new AppError("Project not found", 400);
    }

    const isSuperAdmin =
      actor.role ===
      ROLES.SUPER_ADMIN;

    if (!isSuperAdmin) {
      const manager =
        await Employee.findOne({
          user: actor._id,
        });

      if (!manager) {
        throw new AppError("Manager employee profile not found", 400);
      }

      const isProjectManager =
        String(
          timesheet.project
            .manager
        ) ===
        String(manager._id);

      if (!isProjectManager) {
        throw new AppError("Only the project manager can review this timesheet", 400);
      }
    }

    timesheet.status =
      decision === "approve"
        ? TIMESHEET_STATUS.APPROVED
        : TIMESHEET_STATUS.REJECTED;

    timesheet.managerComment =
      comment;

    timesheet.reviewedBy =
      actor._id;

    timesheet.reviewedAt =
      new Date();

    await timesheet.save();

    return timesheet;
  };

export const getManagerPendingTimesheets =
  async (actor) => {
    if (
      actor.role ===
      ROLES.SUPER_ADMIN
    ) {
      return populateTimesheets(
        Timesheet.find({
          status:
            TIMESHEET_STATUS.PENDING,
        }).sort({
          workDate: 1,
        })
      );
    }

    const manager =
      await Employee.findOne({
        user: actor._id,
      });

    if (!manager) {
      throw new AppError("Manager employee profile not found", 400);
    }

    const projects =
      await Project.find({
        manager:
          manager._id,
      }).select("_id");

    const projectIds =
      projects.map(
        (project) =>
          project._id
      );

    return populateTimesheets(
      Timesheet.find({
        status:
          TIMESHEET_STATUS.PENDING,

        project: {
          $in: projectIds,
        },
      }).sort({
        workDate: 1,
      })
    );
  };

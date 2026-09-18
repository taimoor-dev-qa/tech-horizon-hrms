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
    throw new Error(
      "Decision must be approve or reject"
    );
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
      throw new Error(
        "Timesheet not found"
      );
    }

    if (
      timesheet.status !==
      TIMESHEET_STATUS.PENDING
    ) {
      throw new Error(
        "Timesheet has already been reviewed"
      );
    }

    if (!timesheet.project) {
      throw new Error(
        "Project not found"
      );
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
        throw new Error(
          "Manager employee profile not found"
        );
      }

      const isProjectManager =
        String(
          timesheet.project
            .manager
        ) ===
        String(manager._id);

      if (!isProjectManager) {
        throw new Error(
          "Only the project manager can review this timesheet"
        );
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
      throw new Error(
        "Manager employee profile not found"
      );
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
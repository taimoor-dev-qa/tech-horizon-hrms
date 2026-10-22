import test from "node:test";
import assert from "node:assert/strict";

import AppError from "../utils/AppError.js";
import Announcement from "../models/Announcement.js";
import Asset from "../models/Asset.js";
import AssetAssignment from "../models/AssetAssignment.js";
import Attendance from "../models/Attendance.js";
import Candidate from "../models/Candidate.js";
import CompanySettings from "../models/CompanySettings.js";
import Department from "../models/Department.js";
import Designation from "../models/Designation.js";
import Employee from "../models/Employee.js";
import Interview from "../models/Interview.js";
import Job from "../models/Job.js";
import Project from "../models/Project.js";
import Shift from "../models/Shift.js";
import Team from "../models/Team.js";
import Timesheet from "../models/Timesheet.js";

import { checkOut } from "../services/attendanceService.js";
import {
  getPreviousDate,
} from "../services/attendanceTimeService.js";
import {
  deleteDepartment,
} from "../services/departmentService.js";
import {
  deleteDesignation,
} from "../services/designationService.js";
import {
  deleteTeam,
} from "../services/teamService.js";
import {
  deleteShift,
} from "../services/shiftService.js";
import {
  deleteProject,
} from "../services/projectService.js";
import {
  deleteJob,
} from "../services/jobService.js";
import {
  deleteAsset,
} from "../services/assetService.js";

const query = (value) => ({
  populate() { return this; },
  select() { return this; },
  then(resolve, reject) {
    return Promise.resolve(value).then(resolve, reject);
  },
});

const operational = (message) => (error) => {
  assert.equal(error instanceof AppError, true);
  assert.equal(error.statusCode, 400);
  assert.equal(error.message, message);
  return true;
};

test("previous work date handles month, year, and leap-year boundaries", () => {
  assert.equal(getPreviousDate("2026-03-01"), "2026-02-28");
  assert.equal(getPreviousDate("2024-03-01"), "2024-02-29");
  assert.equal(getPreviousDate("2026-01-01"), "2025-12-31");
});

test("night-shift checkout falls back to the previous company work date", async (t) => {
  const attendance = {
    shift: "recorded-shift",
    checkIn: new Date(Date.now() - 8 * 60 * 60 * 1000),
    checkOut: null,
    workingMinutes: 0,
    status: "present",
    async save() { return this; },
  };
  const filters = [];

  t.mock.method(Employee, "findOne", () => query({
    _id: "employee",
    shift: {
      _id: "shift",
      isNightShift: true,
    },
  }));
  t.mock.method(CompanySettings, "findOne", () => ({
    lean: async () => null,
  }));
  t.mock.method(Attendance, "findOne", async (filter) => {
    filters.push(filter);
    return filters.length === 1 ? null : attendance;
  });
  t.mock.method(Shift, "findById", (id) => {
    assert.equal(id, "recorded-shift");
    return query({ isNightShift: true });
  });

  const result = await checkOut("user");

  assert.equal(result, attendance);
  assert.equal(filters.length, 2);
  assert.deepEqual(filters[0], {
    employee: "employee",
    attendanceDate: filters[0].attendanceDate,
  });
  assert.deepEqual(filters[1], {
    employee: "employee",
    attendanceDate: getPreviousDate(
      filters[0].attendanceDate
    ),
  });
  assert.equal(attendance.checkOut instanceof Date, true);
  assert.equal(attendance.workingMinutes >= 479, true);
});

test("day-shift checkout does not use a previous work date", async (t) => {
  let lookups = 0;
  let shiftLookups = 0;

  t.mock.method(Employee, "findOne", () => query({
    _id: "employee",
    shift: {
      _id: "shift",
      isNightShift: false,
    },
  }));
  t.mock.method(CompanySettings, "findOne", () => ({
    lean: async () => null,
  }));
  t.mock.method(Attendance, "findOne", async () => {
    lookups += 1;
    return lookups === 1
      ? null
      : { shift: "day-shift" };
  });
  t.mock.method(Shift, "findById", () => {
    shiftLookups += 1;
    return query({ isNightShift: false });
  });

  await assert.rejects(
    checkOut("user"),
    operational("Please check in before checking out")
  );
  assert.equal(lookups, 2);
  assert.equal(shiftLookups, 1);
});

const deletionCases = [
  {
    label: "department",
    target: Department,
    remove: deleteDepartment,
    references: [
      { model: Designation, filter: { department: "resource" } },
      { model: Team, filter: { department: "resource" } },
      { model: Employee, filter: { department: "resource" } },
      { model: Job, filter: { department: "resource" } },
      { model: Announcement, filter: { department: "resource" } },
    ],
    message: "Department is in use and cannot be deleted; deactivate it instead",
  },
  {
    label: "designation",
    target: Designation,
    remove: deleteDesignation,
    references: [
      { model: Employee, filter: { designation: "resource" } },
      { model: Job, filter: { designation: "resource" } },
    ],
    message: "Designation is in use and cannot be deleted; deactivate it instead",
  },
  {
    label: "team",
    target: Team,
    remove: deleteTeam,
    references: [
      { model: Employee, filter: { team: "resource" } },
      { model: Announcement, filter: { team: "resource" } },
    ],
    message: "Team is in use and cannot be deleted; deactivate it instead",
  },
  {
    label: "shift",
    target: Shift,
    remove: deleteShift,
    references: [
      { model: Employee, filter: { shift: "resource" } },
      { model: Attendance, filter: { shift: "resource" } },
    ],
    message: "Shift is in use and cannot be deleted; deactivate it instead",
  },
  {
    label: "project",
    target: Project,
    remove: deleteProject,
    references: [
      { model: Timesheet, filter: { project: "resource" } },
    ],
    message: "Project has timesheets and cannot be deleted; deactivate it instead",
  },
  {
    label: "job",
    target: Job,
    remove: deleteJob,
    references: [
      { model: Candidate, filter: { job: "resource" } },
      { model: Interview, filter: { job: "resource" } },
    ],
    message: "Job has recruitment records and cannot be deleted; close it instead",
  },
  {
    label: "asset",
    target: Asset,
    remove: deleteAsset,
    references: [
      { model: AssetAssignment, filter: { asset: "resource" } },
    ],
    message: "Asset has assignment history and cannot be deleted; retire or deactivate it instead",
    targetRecord: { _id: "resource", status: "available" },
  },
];

for (const deletionCase of deletionCases) {
  test(`${deletionCase.label} deletion checks every reference and preserves unreferenced deletion`, async (t) => {
    let blockingModel = null;
    let deleteCalls = 0;
    const deleted = {
      _id: "resource",
      resource: deletionCase.label,
    };

    t.mock.method(
      deletionCase.target,
      "findById",
      async () => deletionCase.targetRecord || { _id: "resource" }
    );
    t.mock.method(
      deletionCase.target,
      "findByIdAndDelete",
      async () => {
        deleteCalls += 1;
        return deleted;
      }
    );

    for (const reference of deletionCase.references) {
      t.mock.method(
        reference.model,
        "exists",
        async (filter) => {
          assert.deepEqual(filter, reference.filter);
          return reference.model === blockingModel
            ? { _id: "reference" }
            : null;
        }
      );
    }

    for (const reference of deletionCase.references) {
      blockingModel = reference.model;

      await assert.rejects(
        deletionCase.remove("resource"),
        operational(deletionCase.message)
      );
    }

    assert.equal(deleteCalls, 0);

    blockingModel = null;
    assert.equal(
      await deletionCase.remove("resource"),
      deleted
    );
    assert.equal(deleteCalls, 1);
  });
}

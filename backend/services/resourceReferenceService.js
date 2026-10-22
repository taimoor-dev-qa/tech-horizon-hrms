import AppError from "../utils/AppError.js";
import Announcement from "../models/Announcement.js";
import AssetAssignment from "../models/AssetAssignment.js";
import Attendance from "../models/Attendance.js";
import Candidate from "../models/Candidate.js";
import Designation from "../models/Designation.js";
import Employee from "../models/Employee.js";
import Interview from "../models/Interview.js";
import Job from "../models/Job.js";
import Team from "../models/Team.js";
import Timesheet from "../models/Timesheet.js";

const assertNoReferences = async (
  references,
  message
) => {
  const results = await Promise.all(
    references.map(({ model, filter }) =>
      model.exists(filter)
    )
  );

  if (results.some(Boolean)) {
    throw new AppError(message, 400);
  }
};

export const assertDepartmentCanBeDeleted =
  async (id) => assertNoReferences(
    [
      { model: Designation, filter: { department: id } },
      { model: Team, filter: { department: id } },
      { model: Employee, filter: { department: id } },
      { model: Job, filter: { department: id } },
      { model: Announcement, filter: { department: id } },
    ],
    "Department is in use and cannot be deleted; deactivate it instead"
  );

export const assertDesignationCanBeDeleted =
  async (id) => assertNoReferences(
    [
      { model: Employee, filter: { designation: id } },
      { model: Job, filter: { designation: id } },
    ],
    "Designation is in use and cannot be deleted; deactivate it instead"
  );

export const assertTeamCanBeDeleted =
  async (id) => assertNoReferences(
    [
      { model: Employee, filter: { team: id } },
      { model: Announcement, filter: { team: id } },
    ],
    "Team is in use and cannot be deleted; deactivate it instead"
  );

export const assertShiftCanBeDeleted =
  async (id) => assertNoReferences(
    [
      { model: Employee, filter: { shift: id } },
      { model: Attendance, filter: { shift: id } },
    ],
    "Shift is in use and cannot be deleted; deactivate it instead"
  );

export const assertProjectCanBeDeleted =
  async (id) => assertNoReferences(
    [
      { model: Timesheet, filter: { project: id } },
    ],
    "Project has timesheets and cannot be deleted; deactivate it instead"
  );

export const assertJobCanBeDeleted =
  async (id) => assertNoReferences(
    [
      { model: Candidate, filter: { job: id } },
      { model: Interview, filter: { job: id } },
    ],
    "Job has recruitment records and cannot be deleted; close it instead"
  );

export const assertAssetCanBeDeleted =
  async (id) => assertNoReferences(
    [
      { model: AssetAssignment, filter: { asset: id } },
    ],
    "Asset has assignment history and cannot be deleted; retire or deactivate it instead"
  );

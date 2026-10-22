import assert from "node:assert/strict";
import {
  after,
  before,
  beforeEach,
  describe,
  test,
} from "node:test";
import mongoose from "mongoose";

import User from "../../models/User.js";
import Employee from "../../models/Employee.js";
import Department from "../../models/Department.js";
import Designation from "../../models/Designation.js";
import Team from "../../models/Team.js";
import Shift from "../../models/Shift.js";
import Attendance from "../../models/Attendance.js";
import Job from "../../models/Job.js";
import Candidate from "../../models/Candidate.js";
import Project from "../../models/Project.js";
import Timesheet from "../../models/Timesheet.js";
import Asset from "../../models/Asset.js";
import AssetAssignment from "../../models/AssetAssignment.js";
import Announcement from "../../models/Announcement.js";
import Counter from "../../models/Counter.js";

import ROLES from "../../constants/roles.js";
import { CANDIDATE_STATUS, JOB_STATUS } from "../../constants/recruitment.js";
import {
  ASSET_CATEGORY,
  ASSET_CONDITION,
  ASSET_STATUS,
  ASSIGNMENT_STATUS,
} from "../../constants/asset.js";
import AppError from "../../utils/AppError.js";
import runTransaction from "../../utils/runTransaction.js";
import { bootstrapSuperAdmin, BOOTSTRAP_ADMIN_ID } from "../../services/bootstrapSuperAdminService.js";
import {
  deactivatePrivilegedUser,
} from "../../services/adminUserService.js";
import { createEmployee } from "../../services/employeeService.js";
import { hireCandidate } from "../../services/candidateHireService.js";
import { deleteDepartment } from "../../services/departmentService.js";
import { deleteDesignation } from "../../services/designationService.js";
import { deleteTeam } from "../../services/teamService.js";
import { deleteShift } from "../../services/shiftService.js";
import { deleteProject } from "../../services/projectService.js";
import { deleteJob } from "../../services/jobService.js";
import { deleteAsset } from "../../services/assetService.js";

const requiredRunFlag = "1";
const requiredConfirmation = "disposable-local-replica-set";
const runEnabled =
  process.env.HRMS_RUN_MONGO_INTEGRATION === requiredRunFlag &&
  process.env.HRMS_CONFIRM_DISPOSABLE_MONGO === requiredConfirmation;

const models = [
  User,
  Employee,
  Department,
  Designation,
  Team,
  Shift,
  Attendance,
  Job,
  Candidate,
  Project,
  Timesheet,
  Asset,
  AssetAssignment,
  Announcement,
  Counter,
];

let databaseName;
let connected = false;
let sequence = 0;

const newEmail = (label) =>
  `${label}-${Date.now()}-${sequence++}@integration.test`;

const makeJob = (department, designation, createdBy, code) => ({
  title: "Integration Engineer",
  code,
  department,
  designation,
  description: "Disposable integration fixture",
  vacancies: 2,
  status: JOB_STATUS.OPEN,
  createdBy,
});

const createUser = (role = ROLES.HR_ADMIN) =>
  User.create({
    name: "Integration User",
    email: newEmail("user"),
    password: "Disposable-password-938!",
    role,
  });

const createOrganization = async () => {
  const department = await Department.create({
    name: `Integration ${sequence}`,
    code: `ITD${sequence++}`,
  });
  const designation = await Designation.create({
    name: `Integration Role ${sequence}`,
    code: `ITG${sequence++}`,
    department: department._id,
  });
  return { department, designation };
};

describe(
  "MongoDB replica-set integration tests",
  { skip: !runEnabled },
  () => {
    before(async () => {
      const uri = process.env.HRMS_MONGO_INTEGRATION_URI;
      assert.ok(uri, "HRMS_MONGO_INTEGRATION_URI is required");

      const parsed = new URL(uri);
      assert.equal(parsed.protocol, "mongodb:", "Use the local disposable MongoDB URI");
      assert.equal(parsed.hostname, "127.0.0.1", "Integration tests only allow loopback MongoDB");
      assert.equal(parsed.port, "27019", "Integration tests only allow the dedicated test port");

      databaseName = `hrms_it_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      await mongoose.connect(uri, {
        dbName: databaseName,
        serverSelectionTimeoutMS: 5000,
      });
      connected = true;

      const topology = await mongoose.connection.db.admin().command({ hello: 1 });
      assert.equal(topology.setName, "rs0", "MongoDB must be the dedicated rs0 replica set");
      await Promise.all(models.map((Model) => Model.createIndexes()));
    });

    beforeEach(async () => {
      await Promise.all(models.map((Model) => Model.deleteMany({})));
    });

    after(async () => {
      if (connected) {
        try {
          await mongoose.connection.db.dropDatabase();
        } finally {
          await mongoose.disconnect();
        }
      }
    });

    test("replica-set transactions commit and roll back writes", async () => {
      const committed = await runTransaction(async (session) => {
        const department = new Department({
          name: "Committed",
          code: "COMMIT",
        });
        await department.save({ session });
        return department;
      });
      assert.equal(await Department.countDocuments({ _id: committed._id }), 1);

      await assert.rejects(
        runTransaction(async (session) => {
          await new Department({
            name: "Rolled Back",
            code: "ROLLBACK",
          }).save({ session });
          throw new Error("intentional rollback assertion");
        }),
        /intentional rollback assertion/
      );
      assert.equal(await Department.countDocuments({ code: "ROLLBACK" }), 0);
    });

    test("bootstrap refuses existing users and concurrent claims create one Super Admin", async () => {
      await createUser();
      await assert.rejects(
        bootstrapSuperAdmin({
          name: "Bootstrap Admin",
          email: newEmail("bootstrap-existing"),
          password: "Disposable-password-938!",
        }),
        { statusCode: 409 }
      );

      await User.deleteMany({});
      const attempts = await Promise.allSettled([
        bootstrapSuperAdmin({
          name: "Bootstrap Admin One",
          email: newEmail("bootstrap-one"),
          password: "Disposable-password-938!",
        }),
        bootstrapSuperAdmin({
          name: "Bootstrap Admin Two",
          email: newEmail("bootstrap-two"),
          password: "Disposable-password-938!",
        }),
      ]);

      assert.equal(attempts.filter((result) => result.status === "fulfilled").length, 1);
      const rejected = attempts.find((result) => result.status === "rejected");
      assert.ok(rejected.reason instanceof AppError);
      assert.equal(rejected.reason.statusCode, 409);
      const admins = await User.find({ role: ROLES.SUPER_ADMIN });
      assert.equal(admins.length, 1);
      assert.equal(String(admins[0]._id), String(BOOTSTRAP_ADMIN_ID));
    });

    test("concurrent privileged-account changes leave one active Super Admin", async () => {
      const admins = await User.create([
        { name: "Admin One", email: newEmail("admin-one"), password: "Disposable-password-938!", role: ROLES.SUPER_ADMIN },
        { name: "Admin Two", email: newEmail("admin-two"), password: "Disposable-password-938!", role: ROLES.SUPER_ADMIN },
      ]);
      const actorId = new mongoose.Types.ObjectId();

      const results = await Promise.allSettled(
        admins.map((admin) => deactivatePrivilegedUser(admin._id, actorId))
      );

      assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
      assert.equal(await User.countDocuments({ role: ROLES.SUPER_ADMIN, isActive: true }), 1);
      const rejected = results.find((result) => result.status === "rejected");
      assert.ok(rejected.reason instanceof AppError);
      assert.ok([400, 409].includes(rejected.reason.statusCode));
    });

    test("employee creation atomically links a user and employee with a hashed temporary password", async () => {
      const { department, designation } = await createOrganization();
      const email = newEmail("employee");
      const employee = await createEmployee({
        name: "Integration Employee",
        email,
        password: "Disposable-password-938!",
        department: department._id,
        designation: designation._id,
        joiningDate: "2026-10-01",
      });

      const user = await User.findById(employee.user).select("+password");
      assert.ok(user);
      assert.equal(user.email, email);
      assert.equal(user.mustChangePassword, true);
      assert.notEqual(user.password, "Disposable-password-938!");
      assert.equal(await user.comparePassword("Disposable-password-938!"), true);
      assert.equal(await Employee.countDocuments({ user: user._id }), 1);
    });

    test("candidate hiring creates the linked employee and updates candidate and job in one transaction", async () => {
      const { department, designation } = await createOrganization();
      const recruiter = await createUser();
      const job = await Job.create(makeJob(department._id, designation._id, recruiter._id, "HIRE-IT"));
      const candidate = await Candidate.create({
        job: job._id,
        name: "Offer Candidate",
        email: newEmail("candidate"),
        phone: "555-0101",
        status: CANDIDATE_STATUS.OFFER,
      });

      const result = await hireCandidate(candidate._id, {
        temporaryPassword: "Disposable-password-938!",
        joiningDate: "2026-10-01",
      });

      const storedCandidate = await Candidate.findById(candidate._id);
      const storedJob = await Job.findById(job._id);
      assert.equal(String(storedCandidate.employee), String(result.employee._id));
      assert.equal(storedCandidate.status, CANDIDATE_STATUS.HIRED);
      assert.equal(storedJob.filledPositions, 1);
      assert.equal(String(result.employee.user), String((await User.findOne({ email: candidate.email }))._id));
    });

    test("MongoDB unique indexes reject concurrent duplicate Job.code and User.email writes", async () => {
      const { department, designation } = await createOrganization();
      const creator = await createUser();
      const writes = await Promise.allSettled([
        Job.create(makeJob(department._id, designation._id, creator._id, "UNIQUE-RACE")),
        Job.create(makeJob(department._id, designation._id, creator._id, "UNIQUE-RACE")),
      ]);

      assert.equal(writes.filter((result) => result.status === "fulfilled").length, 1);
      const failure = writes.find((result) => result.status === "rejected");
      assert.equal(failure.reason.code, 11000);
      assert.equal(await Job.countDocuments({ code: "UNIQUE-RACE" }), 1);

      const email = newEmail("unique-email");
      const duplicateUsers = await Promise.allSettled([
        User.create({ name: "First", email, password: "Disposable-password-938!", role: ROLES.HR_ADMIN }),
        User.create({ name: "Second", email, password: "Disposable-password-938!", role: ROLES.HR_ADMIN }),
      ]);
      assert.equal(duplicateUsers.filter((result) => result.status === "fulfilled").length, 1);
      const emailFailure = duplicateUsers.find((result) => result.status === "rejected");
      assert.equal(emailFailure.reason.code, 11000);
      assert.equal(await User.countDocuments({ email }), 1);
    });

    test("referenced resources cannot be deleted, while an unreferenced department can", async () => {
      const { department, designation } = await createOrganization();
      const user = await createUser();
      const employeeId = new mongoose.Types.ObjectId();
      const employee = await Employee.create({
        _id: employeeId,
        employeeId: "TH-IT-0001",
        user: user._id,
        department: department._id,
        designation: designation._id,
        joiningDate: "2026-10-01",
      });
      const team = await Team.create({
        name: "Integration Team",
        code: "ITTEAM",
        department: department._id,
      });
      employee.team = team._id;
      await employee.save();

      const shift = await Shift.create({
        name: "Integration Shift",
        code: "ITSHIFT",
        startTime: "09:00",
        endTime: "17:00",
      });
      employee.shift = shift._id;
      await employee.save();

      const job = await Job.create(makeJob(department._id, designation._id, user._id, "IT-REF"));
      const project = await Project.create({
        name: "Integration Project",
        code: "IT-PROJ",
        manager: employee._id,
        startDate: "2026-10-01",
        deadline: "2026-12-01",
      });
      const asset = await Asset.create({
        assetTag: "IT-ASSET",
        name: "Integration Laptop",
        category: ASSET_CATEGORY.LAPTOP,
        status: ASSET_STATUS.AVAILABLE,
      });

      await Promise.all([
        Attendance.create({ employee: employee._id, shift: shift._id, attendanceDate: "2026-10-02" }),
        Candidate.create({ job: job._id, name: "Reference Candidate", email: newEmail("ref-candidate"), phone: "555-0102" }),
        Timesheet.create({ employee: employee._id, project: project._id, workDate: "2026-10-02", task: "Test task", hours: 1 }),
        AssetAssignment.create({
          asset: asset._id,
          employee: employee._id,
          assignedDate: "2026-10-01",
          assignedCondition: ASSET_CONDITION.GOOD,
          status: ASSIGNMENT_STATUS.RETURNED,
          assignedBy: user._id,
        }),
        Announcement.create({ title: "Team notice", message: "Test", team: team._id, createdBy: user._id }),
      ]);

      for (const operation of [
        () => deleteDepartment(department._id),
        () => deleteDesignation(designation._id),
        () => deleteTeam(team._id),
        () => deleteShift(shift._id),
        () => deleteProject(project._id),
        () => deleteJob(job._id),
      ]) {
        await assert.rejects(operation(), { statusCode: 400 });
      }

      await assert.rejects(
        deleteAsset(asset._id),
        { statusCode: 400 }
      );
      assert.ok(await Asset.exists({ _id: asset._id }));

      const unused = await Department.create({ name: "Unused", code: "UNUSED" });
      assert.ok(await deleteDepartment(unused._id));
      assert.equal(await Department.exists({ _id: unused._id }), null);
    });
  }
);

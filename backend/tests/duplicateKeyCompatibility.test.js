import test from "node:test";
import assert from "node:assert/strict";
import AppError from "../utils/AppError.js";
import {
  isDuplicateKeyFor,
  mapDuplicateKeyError,
} from "../utils/mongoDuplicateKey.js";
import Department from "../models/Department.js";
import Designation from "../models/Designation.js";
import Team from "../models/Team.js";
import Shift from "../models/Shift.js";
import Holiday from "../models/Holiday.js";
import LeaveType from "../models/LeaveType.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import LeaveBalance from "../models/LeaveBalance.js";
import CompanySettings from "../models/CompanySettings.js";
import HolidayModel from "../models/Holiday.js";
import Counter from "../models/Counter.js";
import Asset from "../models/Asset.js";
import AssetAssignment from "../models/AssetAssignment.js";
import Project from "../models/Project.js";
import PerformanceReview from "../models/PerformanceReview.js";
import Payroll from "../models/Payroll.js";
import SalaryStructure from "../models/SalaryStructure.js";
import LeaveRequest from "../models/LeaveRequest.js";
import Job from "../models/Job.js";
import mongoose from "mongoose";
import errorHandler from "../middleware/errorMiddleware.js";
import {
  createDepartment,
  updateDepartment,
} from "../services/departmentService.js";
import { updateDesignation } from "../services/designationService.js";
import { updateTeam } from "../services/teamService.js";
import { createShift } from "../services/shiftService.js";
import { createHoliday } from "../services/holidayService.js";
import { createLeaveType } from "../services/leaveTypeService.js";
import { createEmployee } from "../services/employeeService.js";
import { updateEmployee } from "../services/employeeUpdateService.js";
import { checkIn } from "../services/attendanceService.js";
import { markManualAttendance } from "../services/attendanceAdminService.js";
import { getOrCreateBalance } from "../services/leaveBalanceService.js";
import { markLeaveAttendance } from "../services/leaveAttendanceService.js";
import { createAsset, updateAsset } from "../services/assetService.js";
import { assignAsset } from "../services/assetAssignmentService.js";
import { updateProject } from "../services/projectService.js";
import { createPerformanceReview } from "../services/performanceService.js";
import { createPayroll } from "../services/payrollService.js";
import { createSalaryStructure } from "../services/salaryStructureService.js";
import { createJob, updateJob } from "../services/jobService.js";

const query = (value) => ({
  session() { return this; },
  populate() { return this; },
  select() { return this; },
  sort() { return this; },
  then(resolve, reject) {
    return Promise.resolve(value).then(resolve, reject);
  },
});

const duplicate = (fields) =>
  Object.assign(
    new Error("duplicate key"),
    {
      code: 11000,
      keyPattern: Object.fromEntries(
        fields.map((field) => [field, 1])
      ),
    }
  );

const operational = (message) => (error) => {
  assert.equal(
    error instanceof AppError,
    true,
    `Expected AppError, received ${error?.name}: ${error?.message}`
  );
  assert.equal(error.statusCode, 400);
  assert.equal(error.message, message);
  return true;
};

test("duplicate-key matcher requires the exact declared index fields", () => {
  const error = duplicate(["name", "department"]);
  assert.equal(isDuplicateKeyFor(error, ["department", "name"]), true);
  assert.equal(isDuplicateKeyFor(error, ["name"]), false);
  assert.equal(isDuplicateKeyFor(error, ["name", "department", "code"]), false);
  assert.equal(
    isDuplicateKeyFor(
      { code: 11000, keyValue: { serialNumber: "SERIAL" } },
      ["serialNumber"]
    ),
    true
  );

  const unrelated = duplicate(["unrelated"]);
  assert.equal(
    mapDuplicateKeyError(unrelated, [
      { fields: ["code"], message: "known conflict" },
    ]),
    unrelated
  );
});

test("department create and update preserve 400 for their unique indexes", async (t) => {
  t.mock.method(Department, "findOne", async () => null);
  const created = { _id: "department", name: "Engineering", code: "ENG" };
  t.mock.method(Department, "create", async () => created);
  assert.equal(
    await createDepartment({ name: "Engineering", code: "ENG" }),
    created
  );

  t.mock.method(Department, "create", async () => {
    throw duplicate(["code"]);
  });
  await assert.rejects(
    createDepartment({ name: "Engineering", code: "ENG" }),
    operational("Department name or code already exists")
  );

  t.mock.method(Department, "findByIdAndUpdate", async () => {
    throw duplicate(["name"]);
  });
  await assert.rejects(
    updateDepartment("department", { name: "Engineering" }),
    operational("Department name or code already exists")
  );
});

test("organization update races map only known compound and code indexes to 400", async (t) => {
  t.mock.method(Designation, "findByIdAndUpdate", () => {
    throw duplicate(["name", "department"]);
  });
  await assert.rejects(
    updateDesignation("designation", { name: "Developer" }),
    operational("Designation name or code already exists")
  );

  t.mock.method(Team, "findByIdAndUpdate", () => {
    throw duplicate(["code"]);
  });
  await assert.rejects(
    updateTeam("team", { code: "CORE" }),
    operational("Team name or code already exists")
  );
});

test("shift, holiday, and leave-type insert races retain their 400 business responses", async (t) => {
  t.mock.method(Shift, "findOne", async () => null);
  t.mock.method(Shift, "create", async () => {
    throw duplicate(["code"]);
  });
  await assert.rejects(
    createShift({ name: "Day", code: "DAY" }),
    operational("Shift name or code already exists")
  );

  t.mock.method(Holiday, "findOne", async () => null);
  t.mock.method(Holiday, "create", async () => {
    throw duplicate(["name", "date"]);
  });
  await assert.rejects(
    createHoliday({ name: "Holiday", date: "2026-01-01" }),
    operational("Holiday already exists for this date")
  );

  t.mock.method(LeaveType, "findOne", async () => null);
  t.mock.method(LeaveType, "create", async () => {
    throw duplicate(["name"]);
  });
  await assert.rejects(
    createLeaveType({ name: "Annual", code: "ANNUAL" }),
    operational("Leave type name or code already exists")
  );
});

test("employee account and CNIC races map only their declared indexes to 400", async (t) => {
  const department = "507f1f77bcf86cd799439011";
  const designation = "507f1f77bcf86cd799439012";
  const session = {};
  const data = {
    name: "Employee",
    email: "employee@example.test",
    password: "test-only-password",
    department,
    designation,
    joiningDate: "2026-01-01",
    cnic: "12345-1234567-1",
  };

  t.mock.method(Department, "findById", () => query({ _id: department }));
  t.mock.method(Designation, "findById", () => query({ _id: designation, department }));
  t.mock.method(User, "findOne", () => query(null));
  t.mock.method(Counter, "findById", () => query({ seq: 1 }));
  t.mock.method(Counter, "findOneAndUpdate", async () => ({ seq: 2 }));
  t.mock.method(User.prototype, "save", async () => {
    throw duplicate(["email"]);
  });
  await assert.rejects(
    createEmployee(data, session),
    operational("Email already exists")
  );

  t.mock.method(User.prototype, "save", async function () {
    return this;
  });
  t.mock.method(Employee.prototype, "save", async () => {
    throw duplicate(["cnic"]);
  });
  await assert.rejects(
    createEmployee(data, session),
    operational("CNIC already exists")
  );

  t.mock.method(mongoose, "startSession", async () => ({
    withTransaction: async (callback) => callback(),
    endSession: async () => {},
  }));
  t.mock.method(Employee, "findById", () => query({
    _id: "employee",
    user: "user",
    department,
    designation,
    save: async () => {},
  }));
  t.mock.method(User, "findByIdAndUpdate", async () => {
    throw duplicate(["email"]);
  });
  await assert.rejects(
    updateEmployee("employee", { email: "duplicate@example.test" }),
    operational("Email already exists")
  );

  t.mock.method(Employee, "findById", () => query({
    _id: "employee",
    user: "user",
    department,
    designation,
    save: async () => { throw duplicate(["cnic"]); },
  }));
  await assert.rejects(
    updateEmployee("employee", { cnic: "54321-7654321-0" }),
    operational("CNIC already exists")
  );
});

test("attendance insert and upsert races preserve 400 business responses", async (t) => {
  t.mock.method(CompanySettings, "findOne", () => ({ lean: async () => null }));
  t.mock.method(Employee, "findOne", () => query({ _id: "employee", shift: { _id: "shift", startTime: "09:00" } }));
  t.mock.method(Attendance, "findOne", async () => null);
  t.mock.method(Attendance, "create", async () => {
    throw duplicate(["employee", "attendanceDate"]);
  });
  await assert.rejects(
    checkIn("user"),
    operational("You have already checked in today")
  );

  t.mock.method(Employee, "findById", () => query({ _id: "employee", shift: { _id: "shift" } }));
  t.mock.method(Attendance, "findOneAndUpdate", async () => {
    throw duplicate(["employee", "attendanceDate"]);
  });
  await assert.rejects(
    markManualAttendance({
      employeeId: "employee",
      attendanceDate: "2026-01-01",
      status: "present",
    }),
    operational("Attendance already exists for this employee and date")
  );
});

test("leave balance and leave-attendance races map their compound indexes to 400", async (t) => {
  t.mock.method(LeaveBalance, "findOneAndUpdate", async () => {
    throw duplicate(["employee", "leaveType", "year"]);
  });
  await assert.rejects(
    getOrCreateBalance("employee", { _id: "leave-type", annualQuota: 10 }, 2026),
    operational("Leave balance already exists")
  );

  t.mock.method(Employee, "findById", () => query({
    _id: "employee",
    shift: { _id: "shift", workingDays: ["monday"] },
  }));
  t.mock.method(HolidayModel, "distinct", async () => []);
  t.mock.method(Attendance, "findOne", () => query(null));
  t.mock.method(Attendance, "findOneAndUpdate", async () => {
    throw duplicate(["employee", "attendanceDate"]);
  });
  await assert.rejects(
    markLeaveAttendance({
      employee: "employee",
      startDate: "2026-01-05",
      endDate: "2026-01-05",
    }),
    operational("Attendance already exists for 2026-01-05")
  );
});

test("payroll and active-salary races retain 400 and payroll skip metadata", async (t) => {
  t.mock.method(CompanySettings, "findOne", () => ({ lean: async () => null }));
  t.mock.method(Employee, "findById", () => query({
    _id: "employee",
    joiningDate: new Date("1999-01-01T00:00:00Z"),
    status: "active",
    employmentEndDate: null,
    shift: { workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"] },
  }));
  t.mock.method(Payroll, "findOne", async () => null);
  t.mock.method(SalaryStructure, "findOne", () => query({
    _id: "salary",
    basicSalary: 1000,
    allowances: {},
    deductions: {},
  }));
  t.mock.method(HolidayModel, "distinct", async () => []);
  t.mock.method(Attendance, "find", () => query([]));
  t.mock.method(LeaveRequest, "find", () => query([]));
  t.mock.method(Payroll, "create", async () => {
    throw duplicate(["employee", "month"]);
  });
  await assert.rejects(
    createPayroll({ employee: "employee", month: "2000-01" }, "actor"),
    (error) => {
      operational("Payroll already exists for this employee and month")(error);
      assert.equal(error.businessCode, "PAYROLL_EXISTS");
      return true;
    }
  );

  t.mock.method(SalaryStructure, "findOne", async () => null);
  t.mock.method(SalaryStructure, "create", async () => {
    throw duplicate(["employee"]);
  });
  await assert.rejects(
    createSalaryStructure({
      employee: "employee",
      basicSalary: 1000,
      effectiveFrom: "2026-01-01",
    }, "actor"),
    operational("Employee already has an active salary structure")
  );
});

test("asset and active-assignment indexes retain their specific 400 responses", async (t) => {
  t.mock.method(Asset, "findOne", async () => null);
  t.mock.method(Asset, "create", async () => {
    throw duplicate(["assetTag"]);
  });
  await assert.rejects(
    createAsset({ assetTag: "LT-1" }),
    operational("Asset tag already exists")
  );

  t.mock.method(Asset, "findByIdAndUpdate", async () => {
    throw duplicate(["serialNumber"]);
  });
  await assert.rejects(
    updateAsset("asset", { serialNumber: "SERIAL" }),
    operational("Asset serial number already exists")
  );

  const session = {
    withTransaction: async (callback) => callback(),
    endSession: async () => {},
  };
  t.mock.method(mongoose, "startSession", async () => session);
  t.mock.method(Employee, "findById", () => query({ _id: "employee" }));
  t.mock.method(Asset, "findOneAndUpdate", async () => ({
    _id: "asset",
    condition: "good",
  }));
  t.mock.method(AssetAssignment, "create", async () => {
    throw duplicate(["asset"]);
  });
  await assert.rejects(
    assignAsset({ asset: "asset", employee: "employee", assignedDate: "2026-01-01" }, "actor"),
    operational("Asset is not available")
  );
});

test("project and performance update/insert races retain their 400 business errors", async (t) => {
  const project = {
    startDate: "2026-01-01",
    deadline: "2026-12-31",
    manager: "manager",
    save: async () => { throw duplicate(["code"]); },
  };
  t.mock.method(Project, "findById", async () => project);
  await assert.rejects(
    updateProject("project", { code: "DUPLICATE" }, { role: "super_admin" }),
    operational("Project code already exists")
  );

  t.mock.method(Employee, "findById", async () => ({ _id: "employee" }));
  t.mock.method(PerformanceReview, "findOne", async () => null);
  t.mock.method(PerformanceReview, "create", async () => {
    throw duplicate(["employee", "periodStart", "periodEnd"]);
  });
  await assert.rejects(
    createPerformanceReview(
      { _id: "reviewer", role: "super_admin" },
      {
        employee: "employee",
        periodStart: "2026-01-01",
        periodEnd: "2026-06-30",
        ratings: {
          technicalSkills: 4,
          productivity: 4,
          communication: 4,
          teamwork: 4,
          attendance: 4,
        },
      }
    ),
    operational("Performance review already exists for this period")
  );
});

test("job create preserves success and maps only a Job.code race to 400", async (t) => {
  const department = "507f1f77bcf86cd799439011";
  const designation = "507f1f77bcf86cd799439012";
  const data = {
    title: "Developer",
    code: "DEV",
    department,
    designation,
    description: "Build software",
  };
  const created = {
    _id: "job",
    ...data,
    createdBy: "actor",
  };

  t.mock.method(Job, "findOne", async () => null);
  t.mock.method(Department, "findById", async () => ({ _id: department }));
  t.mock.method(Designation, "findById", async () => ({
    _id: designation,
    department,
  }));
  t.mock.method(Job, "create", async (input) => {
    assert.deepEqual(input, {
      ...data,
      createdBy: "actor",
    });
    return created;
  });

  assert.equal(await createJob(data, "actor"), created);

  t.mock.method(Job, "create", async () => {
    throw duplicate(["code"]);
  });
  await assert.rejects(
    createJob(data, "actor"),
    operational("Job code already exists")
  );
});

test("job update preserves success and maps a Job.code race to 400", async (t) => {
  const department = "507f1f77bcf86cd799439011";
  const designation = "507f1f77bcf86cd799439012";
  const job = {
    department,
    designation,
    code: "OLD",
    save: async () => {},
  };

  t.mock.method(Department, "findById", async () => ({ _id: department }));
  t.mock.method(Designation, "findById", async () => ({
    _id: designation,
    department,
  }));
  t.mock.method(Job, "findById", async () => job);

  assert.equal(await updateJob("job", { code: "NEW" }), job);
  assert.equal(job.code, "NEW");

  t.mock.method(Job, "findById", async () => ({
    department,
    designation,
    code: "OLD",
    save: async () => { throw duplicate(["code"]); },
  }));
  await assert.rejects(
    updateJob("job", { code: "DUPLICATE" }),
    operational("Job code already exists")
  );
});

test("unrelated job duplicate keys remain centralized 409 conflicts", async (t) => {
  const department = "507f1f77bcf86cd799439011";
  const designation = "507f1f77bcf86cd799439012";
  const databaseError = duplicate(["_id"]);

  t.mock.method(Job, "findOne", async () => null);
  t.mock.method(Department, "findById", async () => ({ _id: department }));
  t.mock.method(Designation, "findById", async () => ({
    _id: designation,
    department,
  }));
  t.mock.method(Job, "create", async () => { throw databaseError; });

  let forwarded;
  await assert.rejects(
    createJob({
      title: "Developer",
      code: "DEV",
      department,
      designation,
      description: "Build software",
    }, "actor"),
    (error) => {
      forwarded = error;
      return error === databaseError;
    }
  );

  let statusCode;
  let body;
  errorHandler(
    forwarded,
    {},
    {
      status(value) {
        statusCode = value;
        return this;
      },
      json(value) {
        body = value;
      },
    },
    () => {}
  );

  assert.equal(statusCode, 409);
  assert.equal(body.success, false);
});

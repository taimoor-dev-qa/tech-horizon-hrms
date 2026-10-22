import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import LeaveRequest from "../models/LeaveRequest.js";
import PerformanceReview from "../models/PerformanceReview.js";
import employeeRoutes from "../routes/employeeRoutes.js";
import attendanceAdminRoutes from "../routes/attendanceAdminRoutes.js";
import reportRoutes from "../routes/reportRoutes.js";
import performanceRoutes from "../routes/performanceRoutes.js";
import errorHandler from "../middleware/errorMiddleware.js";

const ids = {
  manager: "111111111111111111111111",
  teamLead: "222222222222222222222222",
  otherManager: "333333333333333333333333",
  hr: "444444444444444444444444",
  superAdmin: "555555555555555555555555",
  departmentA: "aaaaaaaaaaaaaaaaaaaaaaaa",
  departmentB: "bbbbbbbbbbbbbbbbbbbbbbbb",
  teamA: "cccccccccccccccccccccccc",
  teamB: "dddddddddddddddddddddddd",
  employeeA: "aaaaaaaaaaaaaaaaaaaaaaa1",
  employeeB: "bbbbbbbbbbbbbbbbbbbbbbb2",
  employeeC: "ccccccccccccccccccccccc3",
  employeeD: "ddddddddddddddddddddddd4",
};

const actors = {
  [ids.manager]: {
    _id: ids.manager,
    role: "manager",
    isActive: true,
  },
  [ids.teamLead]: {
    _id: ids.teamLead,
    role: "team_lead",
    isActive: true,
  },
  [ids.otherManager]: {
    _id: ids.otherManager,
    role: "manager",
    isActive: true,
  },
  [ids.hr]: {
    _id: ids.hr,
    role: "hr_admin",
    isActive: true,
  },
  [ids.superAdmin]: {
    _id: ids.superAdmin,
    role: "super_admin",
    isActive: true,
  },
};

const employees = [
  {
    _id: ids.employeeA,
    employeeId: "TH-0001",
    user: { _id: "100000000000000000000001", name: "Direct A", email: "a@example.test" },
    department: ids.departmentA,
    team: ids.teamA,
    manager: ids.manager,
    teamLead: ids.teamLead,
    designation: "100000000000000000000011",
    shift: "100000000000000000000021",
    phone: "0300-SECRET-A",
    cnic: "SECRET-CNIC-A",
    dateOfBirth: "1990-01-01",
    gender: "female",
    joiningDate: "2024-01-01",
    employmentType: "permanent",
    workLocation: "Office",
    status: "active",
  },
  {
    _id: ids.employeeB,
    employeeId: "TH-0002",
    user: { _id: "100000000000000000000002", name: "Team Lead Report", email: "b@example.test" },
    department: ids.departmentB,
    team: ids.teamB,
    manager: ids.otherManager,
    teamLead: ids.teamLead,
    designation: "100000000000000000000012",
    shift: "100000000000000000000022",
    phone: "0300-SECRET-B",
    cnic: "SECRET-CNIC-B",
    dateOfBirth: "1991-01-01",
    joiningDate: "2024-02-01",
    employmentType: "permanent",
    workLocation: "Remote",
    status: "active",
  },
  {
    _id: ids.employeeC,
    employeeId: "TH-0003",
    user: { _id: "100000000000000000000003", name: "Unrelated", email: "c@example.test" },
    department: ids.departmentA,
    team: ids.teamA,
    manager: ids.otherManager,
    teamLead: ids.otherManager,
    designation: "100000000000000000000013",
    shift: "100000000000000000000023",
    phone: "0300-SECRET-C",
    cnic: "SECRET-CNIC-C",
    dateOfBirth: "1992-01-01",
    joiningDate: "2024-03-01",
    employmentType: "contract",
    workLocation: "Office",
    status: "active",
  },
  {
    _id: ids.employeeD,
    employeeId: "TH-0004",
    user: { _id: "100000000000000000000004", name: "Cross Department", email: "d@example.test" },
    department: ids.departmentB,
    team: ids.teamB,
    manager: ids.manager,
    teamLead: null,
    designation: "100000000000000000000014",
    shift: "100000000000000000000024",
    phone: "0300-SECRET-D",
    cnic: "SECRET-CNIC-D",
    dateOfBirth: "1993-01-01",
    joiningDate: "2024-04-01",
    employmentType: "permanent",
    workLocation: "Office",
    status: "active",
  },
];

const attendanceRecords = employees.map((employee, index) => ({
  _id: `20000000000000000000000${index + 1}`,
  employee: employee._id,
  attendanceDate: "2026-10-20",
  status: index === 0 ? "late" : "present",
}));

const leaveRecords = employees.map((employee, index) => ({
  _id: `30000000000000000000000${index + 1}`,
  employee: employee._id,
  leaveType: "400000000000000000000001",
  totalDays: 1,
  status: index === 0 ? "pending_manager" : "approved",
  createdAt: `2026-10-${10 + index}`,
}));

const performanceRecords = [
  {
    _id: "500000000000000000000001",
    employee: ids.employeeA,
    reviewer: ids.otherManager,
    status: "submitted",
    overallScore: 4,
    periodEnd: "2026-06-30",
  },
  {
    _id: "500000000000000000000002",
    employee: ids.employeeC,
    reviewer: ids.manager,
    status: "submitted",
    overallScore: 3,
    periodEnd: "2026-06-30",
  },
  {
    _id: "500000000000000000000003",
    employee: ids.employeeC,
    reviewer: ids.otherManager,
    status: "submitted",
    overallScore: 2,
    periodEnd: "2026-06-30",
  },
];

const comparable = (value) => {
  if (value && typeof value === "object" && "_id" in value) {
    return String(value._id);
  }

  return String(value ?? "");
};

const matches = (record, filter = {}) => {
  if (filter.$and && !filter.$and.every((item) => matches(record, item))) {
    return false;
  }

  if (filter.$or && !filter.$or.some((item) => matches(record, item))) {
    return false;
  }

  return Object.entries(filter).every(([field, expected]) => {
    if (field === "$and" || field === "$or") {
      return true;
    }

    const actual = record[field];

    if (expected instanceof RegExp) {
      return expected.test(comparable(actual));
    }

    if (expected && typeof expected === "object") {
      if (expected.$in) {
        return expected.$in.some(
          (item) => comparable(item) === comparable(actual)
        );
      }

      if (expected.$gte !== undefined && Number(actual) < Number(expected.$gte)) {
        return false;
      }

      if (expected.$lte !== undefined && Number(actual) > Number(expected.$lte)) {
        return false;
      }

      return true;
    }

    return comparable(actual) === comparable(expected);
  });
};

const project = (record, fields) => {
  if (!fields) {
    return { ...record };
  }

  const selected = String(fields).split(/\s+/).filter(Boolean);
  const output = { _id: record._id };

  for (const field of selected) {
    if (Object.hasOwn(record, field)) {
      output[field] = record[field];
    }
  }

  return output;
};

const query = (records) => {
  let selection = null;
  let offset = 0;
  let maximum = null;

  return {
    populate() { return this; },
    sort() { return this; },
    select(fields) { selection = fields; return this; },
    skip(value) { offset = value; return this; },
    limit(value) { maximum = value; return this; },
    then(resolve, reject) {
      let result = Array.isArray(records) ? records.slice(offset) : records;

      if (Array.isArray(result) && maximum !== null) {
        result = result.slice(0, maximum);
      }

      if (Array.isArray(result)) {
        result = result.map((record) => project(record, selection));
      } else if (result) {
        result = project(result, selection);
      }

      return Promise.resolve(result).then(resolve, reject);
    },
  };
};

const installModelMocks = (t) => {
  t.mock.method(User, "findById", async (id) => actors[String(id)] || null);
  t.mock.method(User, "find", () => query([]));
  t.mock.method(Employee, "find", (filter) => query(employees.filter((item) => matches(item, filter))));
  t.mock.method(Employee, "countDocuments", async (filter) => employees.filter((item) => matches(item, filter)).length);
  t.mock.method(Attendance, "find", (filter) => query(attendanceRecords.filter((item) => matches(item, filter))));
  t.mock.method(Attendance, "countDocuments", async (filter) => attendanceRecords.filter((item) => matches(item, filter)).length);
  t.mock.method(LeaveRequest, "find", (filter) => query(leaveRecords.filter((item) => matches(item, filter))));
  t.mock.method(PerformanceReview, "find", (filter) => query(performanceRecords.filter((item) => matches(item, filter))));
  t.mock.method(PerformanceReview, "countDocuments", async (filter) => performanceRecords.filter((item) => matches(item, filter)).length);
};

let server;
let base;
const originalJwtSecret = process.env.JWT_SECRET;

test.before(async () => {
  process.env.JWT_SECRET = "manager-data-scope-test-secret";

  const app = express();
  app.use(express.json());
  app.use("/api/employees", employeeRoutes);
  app.use("/api/attendance/admin", attendanceAdminRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/performance", performanceRoutes);
  app.use(errorHandler);

  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));

  if (originalJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalJwtSecret;
  }
});

const tokenFor = (id) => jwt.sign({ userId: id }, process.env.JWT_SECRET);

const get = async (path, actorId) => {
  const response = await fetch(`${base}${path}`, {
    headers: {
      authorization: `Bearer ${tokenFor(actorId)}`,
    },
  });

  return {
    status: response.status,
    body: await response.json(),
  };
};

test("employee directory uses direct-report scope, preserves filters, and hides personal fields", async (t) => {
  installModelMocks(t);

  const manager = await get("/api/employees", ids.manager);
  assert.equal(manager.status, 200);
  assert.deepEqual(manager.body.employees.map((item) => item.employeeId).sort(), ["TH-0001", "TH-0004"]);
  assert.equal(manager.body.pagination.total, 2);

  for (const employee of manager.body.employees) {
    assert.equal("phone" in employee, false);
    assert.equal("cnic" in employee, false);
    assert.equal("dateOfBirth" in employee, false);
    assert.equal("gender" in employee, false);
  }

  const department = await get(`/api/employees?department=${ids.departmentA}`, ids.manager);
  assert.deepEqual(department.body.employees.map((item) => item.employeeId), ["TH-0001"]);

  const unrelated = await get(`/api/employees?department=${ids.departmentA}`, ids.otherManager);
  assert.deepEqual(unrelated.body.employees.map((item) => item.employeeId), ["TH-0003"]);

  const teamLead = await get("/api/employees", ids.teamLead);
  assert.deepEqual(teamLead.body.employees.map((item) => item.employeeId).sort(), ["TH-0001", "TH-0002"]);

  const sensitiveSearch = await get("/api/employees?search=SECRET-CNIC-A", ids.manager);
  assert.deepEqual(sensitiveSearch.body.employees, []);

  const hr = await get("/api/employees", ids.hr);
  assert.equal(hr.body.employees.length, 4);
  assert.equal(hr.body.employees[0].cnic.startsWith("SECRET-CNIC-"), true);

  const superAdmin = await get("/api/employees", ids.superAdmin);
  assert.equal(superAdmin.body.employees.length, 4);
});

test("attendance routes restrict managers, summaries, and employee filters to direct reports", async (t) => {
  installModelMocks(t);

  const manager = await get("/api/attendance/admin", ids.manager);
  assert.equal(manager.status, 200);
  assert.deepEqual(manager.body.attendance.map((item) => item.employee).sort(), [ids.employeeA, ids.employeeD].sort());
  assert.equal(manager.body.pagination.total, 2);

  const bypass = await get(`/api/attendance/admin?employee=${ids.employeeC}`, ids.manager);
  assert.equal(bypass.status, 200);
  assert.deepEqual(bypass.body.attendance, []);
  assert.equal(bypass.body.pagination.total, 0);

  const summary = await get("/api/attendance/admin/summary?date=2026-10-20", ids.manager);
  assert.deepEqual(summary.body.summary, {
    total: 2,
    present: 1,
    late: 1,
    absent: 0,
    half_day: 0,
    on_leave: 0,
    work_from_home: 0,
  });

  const teamLead = await get("/api/attendance/admin", ids.teamLead);
  assert.equal(teamLead.status, 403);

  const hr = await get("/api/attendance/admin", ids.hr);
  assert.equal(hr.body.attendance.length, 4);
  assert.equal(hr.body.pagination.total, 4);
});

test("manager reports are scoped while HR reports retain organization-wide access", async (t) => {
  installModelMocks(t);

  const employeeReport = await get("/api/reports/employees", ids.manager);
  assert.deepEqual(employeeReport.body.employees.map((item) => item.employeeId).sort(), ["TH-0001", "TH-0004"]);
  assert.equal(employeeReport.body.summary.total, 2);
  assert.equal("cnic" in employeeReport.body.employees[0], false);

  const attendance = await get("/api/reports/attendance", ids.manager);
  assert.deepEqual(attendance.body.records.map((item) => item.employee).sort(), [ids.employeeA, ids.employeeD].sort());

  const leave = await get("/api/reports/leaves", ids.manager);
  assert.deepEqual(leave.body.leaves.map((item) => item.employee).sort(), [ids.employeeA, ids.employeeD].sort());

  const performance = await get("/api/reports/performance", ids.manager);
  assert.deepEqual(performance.body.reviews.map((item) => item._id).sort(), [
    "500000000000000000000001",
    "500000000000000000000002",
  ]);
  assert.equal(performance.body.summary.totalReviews, 2);

  const performanceFilter = await get(`/api/reports/performance?employee=${ids.employeeC}`, ids.manager);
  assert.deepEqual(performanceFilter.body.reviews.map((item) => item._id), [
    "500000000000000000000002",
  ]);

  const bypass = await get(`/api/reports/leaves?employee=${ids.employeeC}`, ids.manager);
  assert.deepEqual(bypass.body.leaves, []);

  const teamLead = await get("/api/reports/performance", ids.teamLead);
  assert.equal(teamLead.status, 403);

  for (const path of ["employees", "attendance", "leaves", "performance"]) {
    const hr = await get(`/api/reports/${path}`, ids.hr);
    const records = hr.body.employees || hr.body.records || hr.body.leaves || hr.body.reviews;
    assert.equal(records.length, path === "performance" ? 3 : 4);
  }
});

test("performance list keeps direct-report and review-author access for managers and team leads", async (t) => {
  installModelMocks(t);

  const manager = await get("/api/performance", ids.manager);
  assert.equal(manager.status, 200);
  assert.deepEqual(manager.body.reviews.map((item) => item._id).sort(), [
    "500000000000000000000001",
    "500000000000000000000002",
  ]);

  const teamLead = await get("/api/performance", ids.teamLead);
  assert.equal(teamLead.status, 200);
  assert.deepEqual(teamLead.body.reviews.map((item) => item._id), [
    "500000000000000000000001",
  ]);

  const hr = await get("/api/performance", ids.hr);
  assert.equal(hr.body.reviews.length, 3);
});

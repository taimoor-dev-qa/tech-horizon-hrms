import test from "node:test";
import assert from "node:assert/strict";
import AppError from "../utils/AppError.js";
import Department from "../models/Department.js";
import User from "../models/User.js";
import { createTeam } from "../services/teamService.js";
import { createDesignation } from "../services/designationService.js";
import { validateSettingsData } from "../services/companySettingsValidationService.js";
import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import Designation from "../models/Designation.js";
import Counter from "../models/Counter.js";
import { createEmployee } from "../services/employeeService.js";
import { updateEmployee } from "../services/employeeUpdateService.js";
import { setEmployeeStatus } from "../services/employeeStatusService.js";
import { validateSchedule, validateModeDetails } from "../services/interviewValidationService.js";
import { hireCandidate } from "../services/candidateHireService.js";
import Attendance from "../models/Attendance.js";
import CompanySettings from "../models/CompanySettings.js";
import { checkIn, checkOut } from "../services/attendanceService.js";
import { validateLeaveDates } from "../services/leaveDateService.js";
import { resolveInitialLeaveStatus } from "../services/leavePolicyService.js";
import { managerDecision } from "../services/leaveApprovalService.js";
import LeaveRequest from "../models/LeaveRequest.js";
import Payroll from "../models/Payroll.js";
import { markPayrollPaid, generatePayroll } from "../services/payrollPaymentService.js";
import { getMyPayslip } from "../services/payslipService.js";
import { validatePayrollMonth, validateSalaryDates } from "../services/payrollValidationService.js";
import SalaryStructure from "../models/SalaryStructure.js";
import { generateBulkPayroll } from "../services/payrollBulkService.js";
import Notification from "../models/Notification.js";
import EmployeeDocument from "../models/EmployeeDocument.js";
import fs from "node:fs/promises";
import path from "node:path";
import { getMyNotifications } from "../services/notificationQueryService.js";
import { getDownloadableDocument } from "../services/documentFileService.js";
import { DOCUMENT_UPLOAD_ROOT } from "../services/documentFileSecurityService.js";
import Timesheet from "../models/Timesheet.js";
import PerformanceReview from "../models/PerformanceReview.js";
import { validateDailyHours, validateWorkDate } from "../services/timesheetValidationService.js";
import { submitPerformanceReview } from "../services/performanceActionService.js";
import { getPerformanceReviewById } from "../services/performanceQueryService.js";
import { validateProjectMembers } from "../services/projectValidationService.js";
import { calculatePayroll } from "../services/payrollCalculationService.js";

const query = (value) => ({
  select() { return this; },
  sort() { return this; },
  session() { return this; },
  populate() { return this; },
  then(resolve, reject) { return Promise.resolve(value).then(resolve, reject); },
});

test("bulk payroll keeps expected skips and masks unexpected per-employee failures", async (t) => {
  t.mock.method(CompanySettings, "findOne", () => ({ lean: async () => null }));
  t.mock.method(SalaryStructure, "find", () => query([{ employee: "employee" }]));
  t.mock.method(Employee, "find", () => query([{ _id: "employee", employeeId: "TH-TEST" }]));
  t.mock.method(Employee, "findById", () => query({ _id: "employee" }));
  t.mock.method(Payroll, "findOne", async () => ({}));
  let results = await generateBulkPayroll("2000-01", "actor");
  assert.deepEqual(results.skipped, [{ employee: "TH-TEST", reason: "Payroll already exists for this employee and month" }]);
  assert.deepEqual(results.failed, []);
  const original = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    t.mock.method(Employee, "findById", () => { throw new Error("private storage failure"); });
    results = await generateBulkPayroll("2000-01", "actor");
    assert.deepEqual(results.failed, [{ employee: "TH-TEST", reason: "Internal server error" }]);
    assert.deepEqual(results.skipped, []);
  } finally {
    if (original === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = original;
  }
});

const operational = (message, statusCode = 400) => (error) => {
  assert.equal(error instanceof AppError, true);
  assert.equal(error.statusCode, statusCode);
  assert.equal(error.message, message);
  return true;
};

test("project, timesheet and performance guards preserve business and access statuses", async (t) => {
  await assert.rejects(validateProjectMembers(["same", "same"]), operational("Duplicate project members are not allowed"));
  assert.throws(() => validateWorkDate("invalid"), operational("Invalid work date"));
  t.mock.method(Timesheet, "find", () => query([{ hours: 23 }]));
  await assert.rejects(validateDailyHours("employee", "2000-01-01", 2), operational("Total daily timesheet hours cannot exceed 24"));
  t.mock.method(PerformanceReview, "findById", async () => ({ status: "submitted" }));
  await assert.rejects(submitPerformanceReview("review", {}), operational("Only draft reviews can be submitted"));
  t.mock.method(PerformanceReview, "findById", async () => ({ reviewer: "someone", employee: "employee" }));
  t.mock.method(Employee, "findById", () => query({ manager: "someone", teamLead: "someone" }));
  await assert.rejects(getPerformanceReviewById({ _id: "other", role: "manager" }, "review"), operational("You do not have access to this performance review", 403));
});

test("notification query scopes counts and rows to recipient and unread filter with pagination", async (t) => {
  for (const [input, expectedFilter, skip, limit] of [
    [{ unreadOnly: "true", page: "2", limit: "5" }, { recipient: "user", isRead: false }, 5, 5],
    [{}, { recipient: "user" }, 0, 20],
  ]) {
    t.mock.method(Notification, "find", (filter) => {
      assert.deepEqual(filter, expectedFilter);
      return { sort(value) { assert.deepEqual(value, { createdAt: -1 }); return this; }, skip(value) { assert.equal(value, skip); return this; }, limit(value) { assert.equal(value, limit); return Promise.resolve([]); } };
    });
    t.mock.method(Notification, "countDocuments", async (filter) => { assert.deepEqual(filter, expectedFilter); return 0; });
    const result = await getMyNotifications("user", input);
    assert.deepEqual(result.notifications, []);
    assert.deepEqual(result.pagination, { page: input.page ? 2 : 1, limit, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: !!input.page });
  }
});

test("document file lookup distinguishes missing files from unexpected storage failures", async (t) => {
  t.mock.method(EmployeeDocument, "findById", async () => ({ isActive: true, filePath: path.join(DOCUMENT_UPLOAD_ROOT, "mock.pdf") }));
  t.mock.method(fs, "access", async () => { throw Object.assign(new Error("missing"), { code: "ENOENT" }); });
  await assert.rejects(getDownloadableDocument("doc", { role: "super_admin" }), operational("Stored document file not found", 404));
  const failure = Object.assign(new Error("private storage failure"), { code: "EACCES" });
  t.mock.method(fs, "access", async () => { throw failure; });
  await assert.rejects(getDownloadableDocument("doc", { role: "super_admin" }), (error) => error === failure);
});

test("payroll payment guards remain 400 and missing payslips remain 404", async (t) => {
  assert.throws(() => calculatePayroll({ salary: { basicSalary: 100 }, otherDeduction: 101 }), operational("Payroll deductions cannot exceed gross salary"));
  assert.throws(() => validatePayrollMonth("2026-13"), operational("Payroll month must use YYYY-MM format"));
  assert.throws(() => validateSalaryDates("2026-02-01", "2026-01-01"), operational("Invalid salary effective date range"));
  t.mock.method(Payroll, "findById", async () => null);
  await assert.rejects(generatePayroll("missing"), operational("Payroll not found"));
  t.mock.method(Payroll, "findById", async () => ({ status: "paid" }));
  await assert.rejects(generatePayroll("paid"), operational("Only draft payroll can be generated"));
  await assert.rejects(markPayrollPaid("paid"), operational("Only generated payroll can be marked as paid"));
  t.mock.method(Employee, "findOne", async () => null);
  await assert.rejects(getMyPayslip("user", "missing"), operational("Employee profile not found", 404));
  t.mock.method(Employee, "findOne", async () => ({ _id: "employee" }));
  t.mock.method(Payroll, "findOne", () => query(null));
  await assert.rejects(getMyPayslip("user", "missing"), operational("Payslip not found", 404));
});

test("leave date, decision and assigned-manager guards remain 400", async (t) => {
  assert.throws(() => validateLeaveDates("invalid", "2026-01-01"), operational("Invalid leave date"));
  assert.throws(() => validateLeaveDates("2026-02-01", "2026-01-01"), operational("Start date cannot be after end date"));
  assert.throws(() => resolveInitialLeaveStatus({}, { managerApprovalRequired: true }), operational("Manager approval is required but no manager is assigned to this employee"));
  await assert.rejects(managerDecision("leave", {}, "invalid"), operational("Decision must be approve or reject"));
  const session = { withTransaction: async (callback) => callback(), endSession: async () => {} };
  t.mock.method(mongoose, "startSession", async () => session);
  t.mock.method(LeaveRequest, "findById", () => query({ status: "pending_manager", employee: { manager: "assigned" } }));
  await assert.rejects(managerDecision("leave", { _id: "other", role: "manager" }, "reject"), operational("You are not this employee's manager"));
});

test("organization services classify missing references and invalid roles as 400", async (t) => {
  t.mock.method(Department, "findById", async () => null);
  await assert.rejects(createDesignation({ department: "missing" }), operational("Department not found"));
  await assert.rejects(createTeam({ department: "missing" }), operational("Department not found"));
  t.mock.method(Department, "findById", async () => ({ _id: "department" }));
  t.mock.method(User, "findById", async () => ({ role: "employee" }));
  await assert.rejects(createTeam({ department: "department", teamLead: "user" }), operational("Selected user must be a team lead or manager"));
});

test("company setting validation remains 400 with unchanged rules", () => {
  assert.throws(() => validateSettingsData({ payroll: { payrollDay: 32 } }), operational("Payroll day must be between 1 and 31"));
  assert.throws(() => validateSettingsData({ leave: { leaveYearStartMonth: 0 } }), operational("Leave year start month must be between 1 and 12"));
  assert.throws(() => validateSettingsData({ attendance: { graceMinutes: -1 } }), operational("Grace minutes cannot be negative"));
});

test("recruitment rejects invalid interview details and incomplete hire data", async () => {
  assert.throws(() => validateSchedule("invalid"), operational("Invalid interview date and time"));
  assert.throws(() => validateSchedule("2000-01-01"), operational("Interview must be scheduled in the future"));
  assert.throws(() => validateModeDetails({ mode: "online" }), operational("Meeting link is required for online interview"));
  await assert.rejects(hireCandidate("unused", {}), operational("Temporary password and joining date are required"));
});

test("attendance preserves check-in/out business guards", async (t) => {
  t.mock.method(Employee, "findOne", () => query(null));
  await assert.rejects(checkIn("user"), operational("Employee profile not found"));
  t.mock.method(Employee, "findOne", () => query({ _id: "employee", shift: { _id: "shift" } }));
  t.mock.method(CompanySettings, "findOne", () => ({ lean: async () => null }));
  t.mock.method(Attendance, "findOne", async () => ({}));
  await assert.rejects(checkIn("user"), operational("You have already checked in today"));
  t.mock.method(Attendance, "findOne", async () => null);
  await assert.rejects(checkOut("user"), operational("Please check in before checking out"));
});

test("employee creation links User and Employee and update/status read the employee ID", async (t) => {
  const department = "507f1f77bcf86cd799439011";
  const designation = "507f1f77bcf86cd799439012";
  const session = { withTransaction: async (callback) => callback(), endSession: async () => {} };
  t.mock.method(mongoose, "startSession", async () => session);
  t.mock.method(Department, "findById", () => query({ _id: department }));
  t.mock.method(Designation, "findById", () => query({ _id: designation, department }));
  t.mock.method(User, "findOne", () => query(null));
  t.mock.method(Counter, "findById", () => query({ seq: 1 }));
  t.mock.method(Counter, "findOneAndUpdate", async () => ({ seq: 2 }));
  let savedUser;
  t.mock.method(User.prototype, "save", async function (options) {
    assert.equal(options.session, session);
    savedUser = this;
    return this;
  });
  t.mock.method(Employee.prototype, "save", async function (options) {
    assert.equal(options.session, session);
    return this;
  });
  const employee = await createEmployee({
    name: "Test employee", email: "employee@example.test", password: "test-only-password",
    department, designation, joiningDate: "2026-01-01",
  });
  assert.equal(String(employee.user), String(savedUser._id));
  assert.equal(savedUser.role, "employee");
  assert.equal(employee.employeeId, "TH-0002");
  const ids = [];
  t.mock.method(Employee, "findById", (id) => { ids.push(id); return query(employee); });
  t.mock.method(User, "findByIdAndUpdate", async (id, changes, options) => {
    assert.equal(String(id), String(employee.user));
    assert.deepEqual(changes, { isActive: true });
    assert.equal(options.session, session);
  });
  const actor = { _id: "actor", role: "hr_admin" };
  assert.equal(await updateEmployee(employee._id, {}, actor), employee);
  assert.equal(await setEmployeeStatus(employee._id, "active", actor), employee);
  assert.equal(ids.length, 4);
  assert.equal(ids.every((id) => String(id) === String(employee._id)), true);
});

import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readFileSync } from "node:fs";
import express from "express";
import AppError from "../utils/AppError.js";
import errorHandler from "../middleware/errorMiddleware.js";

// Load the actual controllers with isolated service boundaries. No model or
// database connection is loaded by these service doubles.
const state = { invoke: () => { throw new Error("private storage failure"); } };
const registry = Symbol.for("hrms.controller-test.services");
globalThis[registry] = state;
const hooks = registerHooks({
  load(url, context, nextLoad) {
    if (url.includes("/backend/services/")) {
      const source = readFileSync(new URL(url), "utf8");
      const names = [...source.matchAll(/export\s+(?:const|(?:async\s+)?function)\s+(\w+)/g)].map((match) => match[1]);
      return {
        format: "module", shortCircuit: true,
        source: names.map((name) => `export const ${name} = (...args) => globalThis[Symbol.for("hrms.controller-test.services")].invoke(${JSON.stringify(name)}, args);`).join("\n"),
      };
    }
    return nextLoad(url, context);
  },
});

const controllerNames = [
  "designation", "team", "shift", "holiday", "companySettings",
  "employee", "employeeManagement", "employeeProfile", "dashboard", "report",
  "job", "interview", "interviewAction", "candidateHire", "announcementAction",
  "attendance", "attendanceAdmin", "leaveType",
  "leaveRequest", "leaveApproval", "leaveBalance",
  "salaryStructure", "payroll", "payrollAction", "payrollBulk", "payrollSummary", "payslip",
  "asset", "assetAssignment", "document", "documentAction", "notification",
  "project", "timesheet", "timesheetApproval", "performance", "performanceAction",
];
const controllers = {};
for (const name of controllerNames) {
  controllers[name] = await import(`../controllers/${name}Controller.js`);
}
hooks.deregister();

const app = express();
app.use(express.json());
for (const [name, handlers] of Object.entries(controllers)) {
  for (const [handlerName, handler] of Object.entries(handlers)) {
    app.post(`/${name}/${handlerName}/:id`, (req, res, next) => {
      req.user = { _id: "507f1f77bcf86cd799439011", role: "super_admin" };
      handler(req, res, next);
    });
  }
}
app.use(errorHandler);

let server;
let base;
const originalMode = process.env.NODE_ENV;
test.before(async () => {
  process.env.NODE_ENV = "production";
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (originalMode === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalMode;
  delete globalThis[registry];
});
const request = (name, handler, body = {}) => fetch(`${base}/${name}/${handler}/507f1f77bcf86cd799439012?date=2026-01-01`, {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
});

for (const name of controllerNames) {
  test(`${name}: every handler forwards unexpected errors and preserves operational status`, async () => {
    for (const handler of Object.keys(controllers[name])) {
      state.invoke = () => { throw new Error("private storage failure"); };
      let response = await request(name, handler);
      assert.equal(response.status, 500, handler);
      assert.deepEqual(await response.json(), { success: false, message: "Internal server error" });
      state.invoke = () => { throw new AppError("Expected business failure", 400); };
      response = await request(name, handler);
      assert.equal(response.status, 400, handler);
      assert.deepEqual(await response.json(), { success: false, message: "Expected business failure" });
    }
  });
}

test("organization resources preserve not-found responses", async () => {
  state.invoke = () => null;
  for (const [name, resource, handlers] of [
    ["designation", "Designation", ["getDesignationById", "updateDesignation", "deleteDesignation"]],
    ["team", "Team", ["getTeamById", "updateTeam", "deleteTeam"]],
    ["shift", "Shift", ["getShiftById", "updateShift", "deleteShift"]],
    ["holiday", "Holiday", ["updateHoliday", "deleteHoliday"]],
    ["employee", "Employee", ["getEmployeeById"]],
    ["employeeManagement", "Employee", ["updateEmployee", "deactivateEmployee", "reactivateEmployee", "changeEmployeeStatus"]],
    ["job", "Job", ["getJobById", "updateJob", "deleteJob"]],
    ["interview", "Interview", ["getInterviewById", "updateInterview"]],
    ["interviewAction", "Interview", ["cancelInterview"]],
    ["salaryStructure", "Salary structure", ["getSalaryByEmployee", "deactivateSalary"]],
    ["payroll", "Payroll", ["getPayrollById"]],
    ["asset", "Asset", ["getAssetById", "updateAsset", "deleteAsset"]],
    ["document", "Document", ["getDocumentById", "updateDocument"]],
    ["documentAction", "Document", ["deleteDocument"]],
    ["notification", "Notification", ["markAsRead"]],
    ["project", "Project", ["getProjectById", "updateProject", "deleteProject"]],
    ["timesheet", "Timesheet", ["updateTimesheet", "deleteTimesheet"]],
    ["performance", "Performance review", ["getPerformanceReviewById", "updatePerformanceReview"]],
  ]) {
    for (const handler of handlers) {
      const response = await request(name, handler);
      assert.equal(response.status, 404);
      assert.deepEqual(await response.json(), { success: false, message: `${resource} not found` });
    }
  }
});

test("team creation preserves success body and service input", async () => {
  const input = { name: "Team A" };
  const team = { _id: "team-id", ...input };
  state.invoke = (name, args) => {
    assert.equal(name, "createTeam");
    assert.deepEqual(args, [input]);
    return team;
  };
  const response = await request("team", "createTeam", input);
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { success: true, message: "Team created successfully", team });
});

test("document and notification lists call their query services and return the paginated contract", async () => {
  for (const [name, handler, key] of [["document", "getDocuments", "documents"], ["notification", "getMyNotifications", "notifications"]]) {
    for (const items of [[], [{ _id: "item" }]]) {
      const pagination = { page: 1, limit: 20, total: items.length, totalPages: items.length ? 1 : 0, hasNextPage: false, hasPrevPage: false };
      let calls = 0;
      state.invoke = (service, args) => {
        calls++;
        assert.equal(service, handler);
        assert.equal(args.length, name === "notification" ? 2 : 1);
        if (name === "notification") assert.equal(args[0], "507f1f77bcf86cd799439011");
        assert.deepEqual({ ...args.at(-1) }, { date: "2026-01-01" });
        return { [key]: items, pagination };
      };
      const response = await request(name, handler);
      assert.equal(response.status, 200);
      assert.equal(calls, 1);
      assert.deepEqual(await response.json(), { success: true, count: items.length, pagination, [key]: items });
    }
  }
});

test("performance GET-by-ID honors the service's explicit access-denied 403", async () => {
  state.invoke = () => {
    throw new AppError(
      "You do not have access to this performance review",
      403
    );
  };
  const response = await request(
    "performance",
    "getPerformanceReviewById"
  );
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), {
    success: false,
    message: "You do not have access to this performance review",
  });
});

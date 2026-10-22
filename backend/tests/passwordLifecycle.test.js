import test from "node:test";
import assert from "node:assert/strict";
import express from "express";

import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Department from "../models/Department.js";
import Designation from "../models/Designation.js";
import ROLES from "../constants/roles.js";
import authRoutes from "../routes/authRoutes.js";
import adminRoutes from "../routes/adminRoutes.js";
import errorHandler from "../middleware/errorMiddleware.js";
import generateToken from "../utils/generateToken.js";
import mongoose from "mongoose";
import {
  PRIVILEGED_ROLES,
} from "../validators/adminUserValidators.js";
import {
  deactivatePrivilegedUser,
} from "../services/adminUserService.js";
import {
  updateEmployee,
} from "../services/employeeUpdateService.js";
import {
  setEmployeeStatus,
} from "../services/employeeStatusService.js";

const idAdmin = "507f1f77bcf86cd799439011";
const idHr = "507f1f77bcf86cd799439012";
const idSecondAdmin = "507f1f77bcf86cd799439013";
const idTarget = "507f1f77bcf86cd799439014";

const query = (value) => ({
  sort() { return this; },
  session() { return this; },
  select() { return this; },
  then(resolve, reject) {
    return Promise.resolve(value).then(resolve, reject);
  },
});

const createSession = () => ({
  withTransaction: async (callback) => callback(),
  endSession: async () => {},
});

const withServer = async (app, run) => {
  app.use(errorHandler);
  const server = app.listen(0, "127.0.0.1");
  try {
    await new Promise((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    await run(base);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

test("temporary employee passwords force a change before protected access", async (t) => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "password-lifecycle-test-secret";
  let storedPassword = "temporary-test-password";
  const employee = {
    _id: idTarget,
    name: "New Employee",
    email: "new.employee@example.test",
    role: ROLES.EMPLOYEE,
    isActive: true,
    mustChangePassword: true,
    tokenVersion: 0,
    async comparePassword(password) {
      return password === storedPassword;
    },
    async save() {
      storedPassword = this.password;
      delete this.password;
    },
  };

  t.mock.method(User, "findOne", (filter) => query(
    filter.email === employee.email
      ? {
          ...employee,
          async comparePassword(password) {
            return password === storedPassword;
          },
          save: async () => {},
        }
      : null
  ));
  t.mock.method(User, "findById", () => query(employee));

  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  await withServer(app, async (base) => {
    const login = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: employee.email,
        password: "temporary-test-password",
      }),
    });
    assert.equal(login.status, 200);
    const loginBody = await login.json();
    assert.equal(loginBody.user.mustChangePassword, true);

    const headers = {
      authorization: `Bearer ${loginBody.token}`,
    };
    const blocked = await fetch(`${base}/api/auth/me`, { headers });
    assert.equal(blocked.status, 403);
    assert.equal(
      (await blocked.json()).message,
      "You must change your password before continuing"
    );

    const blockedAdminRoute = await fetch(
      `${base}/api/admin/access`,
      { headers }
    );
    assert.equal(blockedAdminRoute.status, 403);
    assert.equal(
      (await blockedAdminRoute.json()).message,
      "You must change your password before continuing"
    );

    const wrongCurrentPassword = await fetch(
      `${base}/api/auth/change-password`,
      {
        method: "PATCH",
        headers: {
          ...headers,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: "incorrect-test-password",
          newPassword: "a-longer-test-password",
        }),
      }
    );
    assert.equal(wrongCurrentPassword.status, 400);
    assert.equal(employee.mustChangePassword, true);

    const samePassword = await fetch(
      `${base}/api/auth/change-password`,
      {
        method: "PATCH",
        headers: {
          ...headers,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: "temporary-test-password",
          newPassword: "temporary-test-password",
        }),
      }
    );
    assert.equal(samePassword.status, 400);
    assert.equal(employee.mustChangePassword, true);

    const changed = await fetch(`${base}/api/auth/change-password`, {
      method: "PATCH",
      headers: {
        ...headers,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        currentPassword: "temporary-test-password",
        newPassword: "a-longer-test-password",
      }),
    });
    assert.equal(changed.status, 200);
    const changedBody = await changed.json();
    assert.equal(changedBody.user.mustChangePassword, false);
    assert.equal(changedBody.user.password, undefined);
    assert.equal(changedBody.token, undefined);

    const profile = await fetch(`${base}/api/auth/me`, { headers });
    assert.equal(profile.status, 200);
    const profileBody = await profile.json();
    assert.equal(profileBody.user.password, undefined);
    assert.equal(profileBody.user.tokenVersion, undefined);
  });

  if (previousSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousSecret;
});

test("last active Super Admin cannot be deactivated", async (t) => {
  const target = {
    _id: idTarget,
    role: ROLES.SUPER_ADMIN,
    isActive: true,
    accountGuardVersion: 0,
    async save() {
      assert.fail("The account must not be changed");
    },
  };

  t.mock.method(mongoose, "startSession", async () => createSession());
  t.mock.method(User, "findById", () => query(target));
  t.mock.method(User, "findOne", () => query(target));
  t.mock.method(User, "findOneAndUpdate", async () => target);
  t.mock.method(User, "countDocuments", () => query(1));

  await assert.rejects(
    deactivatePrivilegedUser(idTarget, "another-admin"),
    (error) => {
      assert.equal(error.statusCode, 400, `${error.name}: ${error.message}`);
      assert.equal(
        error.message,
        "The last active Super Admin cannot be deactivated or demoted"
      );
      return true;
    }
  );
  assert.equal(target.isActive, true);
});

test("employee management cannot bypass privileged-account or self-lockout rules", async (t) => {
  const session = createSession();
  const employee = {
    _id: idTarget,
    user: idAdmin,
    department: "507f1f77bcf86cd799439021",
    designation: "507f1f77bcf86cd799439022",
    status: "active",
    joiningDate: new Date("2020-01-01T00:00:00Z"),
    async save() {
      assert.fail("Employee record must not be changed");
    },
  };
  let linkedUser = {
    _id: idAdmin,
    role: ROLES.SUPER_ADMIN,
  };

  t.mock.method(mongoose, "startSession", async () => session);
  t.mock.method(Employee, "findById", () => query(employee));
  t.mock.method(Department, "findById", () => query({ _id: employee.department }));
  t.mock.method(Designation, "findById", () => query({
    _id: employee.designation,
    department: employee.department,
  }));
  t.mock.method(User, "findById", () => query(linkedUser));

  await assert.rejects(
    updateEmployee(
      idTarget,
      { role: "manager" },
      { _id: idHr, role: ROLES.HR_ADMIN }
    ),
    { statusCode: 403 }
  );
  await assert.rejects(
    setEmployeeStatus(
      idTarget,
      "inactive",
      { _id: idHr, role: ROLES.HR_ADMIN }
    ),
    { statusCode: 403 }
  );

  linkedUser = {
    _id: idTarget,
    role: ROLES.EMPLOYEE,
  };
  employee.user = idTarget;
  await assert.rejects(
    updateEmployee(
      idTarget,
      { role: ROLES.MANAGER },
      { _id: idTarget, role: ROLES.EMPLOYEE }
    ),
    { statusCode: 400 }
  );
  await assert.rejects(
    setEmployeeStatus(
      idTarget,
      "inactive",
      { _id: idTarget, role: ROLES.EMPLOYEE }
    ),
    { statusCode: 400 }
  );
});

test("Super Admin account workflows enforce authorization, safe fields, and last-admin protection", async (t) => {
  const previousSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "admin-account-test-secret";

  const accounts = new Map();
  const makeAccount = (id, role, overrides = {}) => {
    const user = {
      _id: id,
      name: role,
      email: `${role}-${id.slice(-2)}@example.test`,
      role,
      isActive: true,
      mustChangePassword: false,
      tokenVersion: 0,
      accountGuardVersion: 0,
      async save() {
        accounts.set(String(this._id), this);
      },
      ...overrides,
    };
    accounts.set(String(id), user);
    return user;
  };

  makeAccount(idAdmin, ROLES.SUPER_ADMIN);
  makeAccount(idHr, ROLES.HR_ADMIN);
  makeAccount(idSecondAdmin, ROLES.SUPER_ADMIN);
  makeAccount(idTarget, ROLES.FINANCE);

  t.mock.method(mongoose, "startSession", async () => createSession());
  t.mock.method(User, "findById", (id) => query(accounts.get(String(id)) ?? null));
  t.mock.method(User, "findOne", (filter) => {
    const first = [...accounts.values()]
      .filter((user) => user.role === filter.role && user.isActive === filter.isActive)
      .sort((a, b) => String(a._id).localeCompare(String(b._id)))[0] ?? null;
    return query(first);
  });
  t.mock.method(User, "findOneAndUpdate", async (filter, update) => {
    const user = accounts.get(String(filter._id));
    if (!user || user.role !== filter.role || user.isActive !== filter.isActive) {
      return null;
    }
    user.accountGuardVersion += update.$inc.accountGuardVersion;
    return user;
  });
  t.mock.method(User, "countDocuments", (filter) => query(
    [...accounts.values()].filter((user) =>
      user.role === filter.role && user.isActive === filter.isActive
    ).length
  ));

  const app = express();
  app.use(express.json());
  app.use("/api/admin", adminRoutes);
  await withServer(app, async (base) => {
    const adminToken = generateToken(idAdmin);
    const hrToken = generateToken(idHr);
    const targetToken = generateToken(idTarget);
    const call = (path, method, token, body) => fetch(`${base}${path}`, {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { "content-type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

    const hrDenied = await call(
      `/api/admin/users/${idTarget}/deactivate`,
      "PATCH",
      hrToken
    );
    assert.equal(hrDenied.status, 403);
    assert.equal(accounts.get(idTarget).isActive, true);

    for (const [path, body] of [
      [`/api/admin/users/${idTarget}/reactivate`, undefined],
      [`/api/admin/users/${idTarget}/password`, { newPassword: "temporary-reset-test-password" }],
      [`/api/admin/users/${idTarget}/role`, { role: ROLES.HR_ADMIN }],
    ]) {
      const denied = await call(
        path,
        "PATCH",
        hrToken,
        body
      );
      assert.equal(denied.status, 403);
      assert.equal(accounts.get(idTarget).role, ROLES.FINANCE);
      assert.equal(accounts.get(idTarget).tokenVersion, 0);
    }

    const selfDenied = await call(
      `/api/admin/users/${idAdmin}/deactivate`,
      "PATCH",
      adminToken
    );
    assert.equal(selfDenied.status, 400);
    assert.equal(accounts.get(idAdmin).isActive, true);

    const selfRoleDenied = await call(
      `/api/admin/users/${idAdmin}/role`,
      "PATCH",
      adminToken,
      { role: ROLES.HR_ADMIN }
    );
    assert.equal(selfRoleDenied.status, 400);
    assert.equal(accounts.get(idAdmin).role, ROLES.SUPER_ADMIN);

    const selfResetDenied = await call(
      `/api/admin/users/${idAdmin}/password`,
      "PATCH",
      adminToken,
      { newPassword: "temporary-reset-test-password" }
    );
    assert.equal(selfResetDenied.status, 400);
    assert.equal(accounts.get(idAdmin).tokenVersion, 0);

    const demoteLast = await call(
      `/api/admin/users/${idAdmin}/role`,
      "PATCH",
      adminToken,
      { role: ROLES.HR_ADMIN }
    );
    assert.equal(demoteLast.status, 400);
    assert.equal(accounts.get(idAdmin).role, ROLES.SUPER_ADMIN);

    const deactivate = await call(
      `/api/admin/users/${idSecondAdmin}/deactivate`,
      "PATCH",
      adminToken
    );
    assert.equal(deactivate.status, 200);
    assert.equal(accounts.get(idSecondAdmin).isActive, false);
    assert.equal(accounts.get(idSecondAdmin).tokenVersion, 1);
    const deactivatedBody = await deactivate.json();
    assert.equal(deactivatedBody.user.password, undefined);
    assert.equal(deactivatedBody.user.token, undefined);

    const reactivate = await call(
      `/api/admin/users/${idSecondAdmin}/reactivate`,
      "PATCH",
      adminToken
    );
    assert.equal(reactivate.status, 200);
    assert.equal(accounts.get(idSecondAdmin).isActive, true);

    const invalidRole = await call(
      `/api/admin/users/${idTarget}/role`,
      "PATCH",
      adminToken,
      { role: ROLES.EMPLOYEE }
    );
    assert.equal(invalidRole.status, 400);
    assert.equal(accounts.get(idTarget).role, ROLES.FINANCE);

    const changeRole = await call(
      `/api/admin/users/${idTarget}/role`,
      "PATCH",
      adminToken,
      { role: ROLES.HR_ADMIN }
    );
    assert.equal(changeRole.status, 200);
    assert.equal(accounts.get(idTarget).role, ROLES.HR_ADMIN);
    assert.equal(accounts.get(idTarget).tokenVersion, 1);

    const reset = await call(
      `/api/admin/users/${idTarget}/password`,
      "PATCH",
      adminToken,
      { newPassword: "temporary-reset-test-password" }
    );
    assert.equal(reset.status, 200);
    assert.equal(accounts.get(idTarget).mustChangePassword, true);
    assert.equal(accounts.get(idTarget).tokenVersion, 2);
    const resetBody = await reset.json();
    assert.equal(resetBody.user.password, undefined);
    assert.equal(resetBody.user.token, undefined);
    assert.equal(JSON.stringify(resetBody).includes("temporary-reset-test-password"), false);

    const invalidatedToken = await call(
      "/api/admin/access",
      "GET",
      targetToken
    );
    assert.equal(invalidatedToken.status, 401);

    assert.equal(
      PRIVILEGED_ROLES.includes(ROLES.MANAGER),
      false
    );
  });

  if (previousSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousSecret;
});

import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import ROLES from "../constants/roles.js";
import authRoutes from "../routes/authRoutes.js";
import adminRoutes from "../routes/adminRoutes.js";
import employeeRoutes from "../routes/employeeRoutes.js";
import errorHandler from "../middleware/errorMiddleware.js";
import generateToken from "../utils/generateToken.js";
import {
  bootstrapSuperAdmin,
  BOOTSTRAP_ADMIN_ID,
} from "../services/bootstrapSuperAdminService.js";
import {
  createPrivilegedUser,
} from "../services/adminUserService.js";
import {
  privilegedUserSchema,
} from "../validators/adminUserValidators.js";
import { createEmployeeSchema } from "../validators/employeeValidators.js";
import { EMPLOYMENT_TYPES } from "../constants/employee.js";
import User from "../models/User.js";

const account = {
  name: "Initial Admin",
  email: "admin@example.test",
  password: "long-test-password",
};

const makeUserModel = (initialUsers = []) => {
  const users = [...initialUsers];
  return {
    users,
    async exists(filter) {
      if (filter.email) {
        return users.some((user) => user.email === filter.email);
      }
      return users.length > 0;
    },
    async create(data) {
      // Models MongoDB's atomic unique _id and email constraints.
      if (users.some((user) => String(user._id) === String(data._id))) {
        throw Object.assign(new Error("duplicate key"), { code: 11000 });
      }
      if (users.some((user) => user.email === data.email)) {
        throw Object.assign(new Error("duplicate key"), { code: 11000 });
      }
      const user = { ...data, _id: data._id ?? `generated-${users.length + 1}` };
      users.push(user);
      return user;
    },
  };
};

test("bootstrap creates exactly one Super Admin with the reserved MongoDB ID", async () => {
  const model = makeUserModel();
  await bootstrapSuperAdmin(account, model);
  assert.equal(model.users.length, 1);
  assert.equal(model.users[0].role, ROLES.SUPER_ADMIN);
  assert.equal(String(model.users[0]._id), String(BOOTSTRAP_ADMIN_ID));
});

test("Mongoose create preserves the reserved ID and runs password hashing", async () => {
  const originalInsertOne = User.collection.insertOne;
  let inserted;
  User.collection.insertOne = async (document) => {
    inserted = document;
    return { acknowledged: true, insertedId: document._id };
  };
  try {
    await User.create({
      _id: BOOTSTRAP_ADMIN_ID,
      ...account,
      role: ROLES.SUPER_ADMIN,
    });
    assert.equal(String(inserted._id), String(BOOTSTRAP_ADMIN_ID));
    assert.notEqual(inserted.password, account.password);
    assert.equal(inserted.password.startsWith("$2"), true);
  } finally {
    User.collection.insertOne = originalInsertOne;
  }
});

test("bootstrap refuses any database that already has a user", async () => {
  const model = makeUserModel([{ _id: "existing", email: "existing@example.test" }]);
  await assert.rejects(bootstrapSuperAdmin(account, model), { statusCode: 409 });
  assert.equal(model.users.length, 1);
});

test("concurrent bootstrap attempts yield one account and one safe conflict", async () => {
  const model = makeUserModel();
  // Force both preflight reads to happen before either insertion.
  let reads = 0;
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  model.exists = async () => {
    reads += 1;
    if (reads === 2) release();
    await gate;
    return false;
  };
  const results = await Promise.allSettled([
    bootstrapSuperAdmin(account, model),
    bootstrapSuperAdmin(account, model),
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(results.filter((result) => result.status === "rejected" && result.reason.statusCode === 409).length, 1);
  assert.equal(model.users.length, 1);
});

test("privileged creation allows only the explicit role list and returns no credentials", async () => {
  const model = makeUserModel();
  for (const role of [ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.FINANCE]) {
    const input = { ...account, email: `${role}@example.test`, role };
    assert.equal(privilegedUserSchema.safeParse(input).success, true);
    const user = await createPrivilegedUser(input, model);
    assert.equal(user.role, role);
    assert.equal(user.password, undefined);
    assert.equal(user.token, undefined);
  }
  for (const role of [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.TEAM_LEAD]) {
    assert.equal(privilegedUserSchema.safeParse({ ...account, role }).success, false);
    await assert.rejects(createPrivilegedUser({ ...account, role }, model), { statusCode: 400 });
  }
});

test("privileged creation rejects duplicate accounts", async () => {
  const model = makeUserModel([{ _id: "existing", email: account.email }]);
  await assert.rejects(
    createPrivilegedUser({ ...account, role: ROLES.HR_ADMIN }, model),
    { statusCode: 409 }
  );
  assert.equal(model.users.length, 1);
});

test("privileged creation handles a duplicate-key race safely", async () => {
  const model = makeUserModel();
  model.exists = async () => false;
  const input = { ...account, role: ROLES.HR_ADMIN };
  await createPrivilegedUser(input, model);
  await assert.rejects(createPrivilegedUser(input, model), { statusCode: 409 });
  assert.equal(model.users.length, 1);
});

test("staff creation retains the employee-only role schema", () => {
  const staff = {
    ...account,
    department: "507f1f77bcf86cd799439011",
    designation: "507f1f77bcf86cd799439012",
    joiningDate: "2026-01-01",
    employmentType: Object.values(EMPLOYMENT_TYPES)[0],
  };
  assert.equal(createEmployeeSchema.safeParse({ ...staff, role: ROLES.EMPLOYEE }).success, true);
  assert.equal(createEmployeeSchema.safeParse({ ...staff, role: ROLES.HR_ADMIN }).success, false);
});

test("mounted registration, login, /me, and account-creation routes enforce Phase 1 rules", async () => {
  const originalSecret = process.env.JWT_SECRET;
  const originalFindById = User.findById;
  const originalFindOne = User.findOne;
  const originalExists = User.exists;
  const originalCreate = User.create;
  process.env.JWT_SECRET = "registration-security-test-only-secret";

  const superAdmin = {
    _id: "507f1f77bcf86cd799439011",
    name: "Super Admin",
    email: "super@example.test",
    role: ROLES.SUPER_ADMIN,
    isActive: true,
  };
  const hrAdmin = {
    _id: "507f1f77bcf86cd799439012",
    name: "HR Admin",
    email: "hr@example.test",
    role: ROLES.HR_ADMIN,
    isActive: true,
  };
  const users = new Map([[superAdmin._id, superAdmin], [hrAdmin._id, hrAdmin]]);
  const created = [];
  User.findById = async (id) => users.get(String(id)) ?? null;
  User.findOne = ({ email }) => ({
    select: async () => email === superAdmin.email
      ? {
          ...superAdmin,
          comparePassword: async (password) => password === account.password,
          save: async () => {},
        }
      : null,
  });
  User.exists = async ({ email }) => created.some((user) => user.email === email);
  User.create = async (data) => {
    const user = { ...data, _id: "507f1f77bcf86cd799439013" };
    created.push(user);
    return user;
  };

  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/employees", employeeRoutes);
  app.use(errorHandler);
  const server = app.listen(0, "127.0.0.1");
  try {
    await new Promise((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });
    const address = server.address();
    const base = `http://127.0.0.1:${address.port}`;
    const post = (path, body, token) => fetch(`${base}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const register = await post("/api/auth/register", account);
    assert.equal(register.status, 410);
    assert.equal((await register.json()).success, false);
    assert.equal(created.length, 0);

    const privileged = { ...account, role: ROLES.HR_ADMIN };
    const anonymous = await post("/api/admin/users", privileged);
    assert.equal(anonymous.status, 401);
    assert.equal(created.length, 0);

    const hrToken = generateToken(hrAdmin._id);
    const forbidden = await post("/api/admin/users", privileged, hrToken);
    assert.equal(forbidden.status, 403);
    assert.equal(created.length, 0);

    const login = await post("/api/auth/login", {
      email: superAdmin.email,
      password: account.password,
    });
    assert.equal(login.status, 200);
    const loginBody = await login.json();
    assert.equal(loginBody.success, true);
    assert.equal(typeof loginBody.token, "string");
    assert.deepEqual(Object.keys(loginBody.user).sort(), ["email", "id", "mustChangePassword", "name", "role"]);
    assert.equal(loginBody.user.role, ROLES.SUPER_ADMIN);
    assert.equal(loginBody.user.mustChangePassword, false);

    const me = await fetch(`${base}/api/auth/me`, {
      headers: { authorization: `Bearer ${loginBody.token}` },
    });
    assert.equal(me.status, 200);
    const meBody = await me.json();
    assert.equal(meBody.user._id, superAdmin._id);
    assert.equal(meBody.user.role, ROLES.SUPER_ADMIN);
    assert.equal(meBody.user.password, undefined);

    const allowed = await post("/api/admin/users", privileged, loginBody.token);
    assert.equal(allowed.status, 201);
    const allowedBody = await allowed.json();
    assert.deepEqual(Object.keys(allowedBody.user).sort(), ["email", "id", "name", "role"]);
    assert.equal(allowedBody.user.role, ROLES.HR_ADMIN);
    assert.equal(created.length, 1);

    for (const role of [ROLES.EMPLOYEE, "unrecognized"]) {
      const disallowed = await post("/api/admin/users", {
        ...privileged,
        email: `${role}@example.test`,
        role,
      }, loginBody.token);
      assert.equal(disallowed.status, 400);
      assert.equal(created.length, 1);
    }

    const duplicate = await post("/api/admin/users", privileged, loginBody.token);
    assert.equal(duplicate.status, 409);
    assert.equal(created.length, 1);

    const staff = await post("/api/employees", {});
    assert.equal(staff.status, 401);

    const privilegedStaff = await post("/api/employees", {
      ...privileged,
      department: "507f1f77bcf86cd799439014",
      designation: "507f1f77bcf86cd799439015",
      joiningDate: "2026-01-01",
      employmentType: Object.values(EMPLOYMENT_TYPES)[0],
    }, hrToken);
    assert.equal(privilegedStaff.status, 400);
    assert.equal(created.length, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    User.findById = originalFindById;
    User.findOne = originalFindOne;
    User.exists = originalExists;
    User.create = originalCreate;
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  }
});

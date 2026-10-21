import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import User from "../models/User.js";
import authRoutes from "../routes/authRoutes.js";
import errorHandler from "../middleware/errorMiddleware.js";

test("actual login routes preserve client failures and mask unexpected failures", async (t) => {
  const originalMode = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use(errorHandler);
  const server = app.listen(0, "127.0.0.1");
  try {
    await new Promise((resolve, reject) => { server.once("listening", resolve); server.once("error", reject); });
    const base = `http://127.0.0.1:${server.address().port}`;
    const login = (body = { email: "test@example.test", password: "test-only-password" }) => fetch(`${base}/api/auth/login`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
    });
    assert.equal((await login({})).status, 400);
    for (const [user, status, message] of [
      [null, 401, "Invalid email or password"],
      [{ isActive: false }, 403, "Your account is inactive"],
      [{ isActive: true, comparePassword: async () => false }, 401, "Invalid email or password"],
    ]) {
      t.mock.method(User, "findOne", () => ({ select: async () => user }));
      const response = await login();
      assert.equal(response.status, status);
      assert.deepEqual(await response.json(), { success: false, message });
    }
    t.mock.method(User, "findOne", () => { throw new Error("private storage failure"); });
    const response = await login();
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { success: false, message: "Internal server error" });
    assert.equal((await fetch(`${base}/api/auth/me`)).status, 401);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (originalMode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalMode;
  }
});

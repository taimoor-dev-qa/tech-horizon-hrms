import test from "node:test";
import assert from "node:assert/strict";
import express from "express";

import Announcement from "../models/Announcement.js";
import { ANNOUNCEMENT_STATUS } from "../constants/announcement.js";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  updateAnnouncement,
} from "../controllers/announcementController.js";
import errorHandler from "../middleware/errorMiddleware.js";

const id = "507f1f77bcf86cd799439011";

test("announcement errors use centralized handling without a database", async () => {
  const originalCreate = Announcement.create;
  const originalFindById = Announcement.findById;
  const originalFindByIdAndDelete = Announcement.findByIdAndDelete;

  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = { _id: id };
    next();
  });
  app.post("/announcements", createAnnouncement);
  app.get("/announcements/:id", getAnnouncementById);
  app.put("/announcements/:id", updateAnnouncement);
  app.delete("/announcements/:id", deleteAnnouncement);
  app.use(errorHandler);

  const server = app.listen(0, "127.0.0.1");
  try {
    await new Promise((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = (method, path, body) => fetch(`${base}${path}`, {
      method,
      headers: { "content-type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const draft = { _id: id, title: "Notice", status: ANNOUNCEMENT_STATUS.DRAFT };
    Announcement.create = async () => draft;
    const created = await request("POST", "/announcements", { title: "Notice", message: "Message" });
    assert.equal(created.status, 201);
    assert.deepEqual(await created.json(), {
      success: true,
      message: "Announcement created successfully",
      announcement: draft,
    });

    const invalidTarget = await request("POST", "/announcements", {
      title: "Notice",
      message: "Message",
      audience: "roles",
      roles: [],
    });
    assert.equal(invalidTarget.status, 400);
    assert.equal((await invalidTarget.json()).message, "At least one role is required");

    Announcement.findById = async () => ({
      status: ANNOUNCEMENT_STATUS.PUBLISHED,
    });
    const nonDraft = await request("PUT", `/announcements/${id}`, {});
    assert.equal(nonDraft.status, 400);
    assert.equal((await nonDraft.json()).message, "Only draft announcements can be edited");

    const published = await request("DELETE", `/announcements/${id}`);
    assert.equal(published.status, 400);
    assert.equal((await published.json()).message, "Published announcement cannot be deleted");

    Announcement.findById = async () => ({
      _id: id,
      title: "Notice",
      status: ANNOUNCEMENT_STATUS.DRAFT,
      toObject() { return { title: this.title }; },
      async save() { },
    });
    const updated = await request("PUT", `/announcements/${id}`, { title: "Updated notice" });
    assert.equal(updated.status, 200);
    const updatedBody = await updated.json();
    assert.equal(updatedBody.message, "Announcement updated successfully");
    assert.equal(updatedBody.announcement.title, "Updated notice");

    Announcement.findByIdAndDelete = async () => ({ _id: id });
    const deleted = await request("DELETE", `/announcements/${id}`);
    assert.equal(deleted.status, 200);
    assert.deepEqual(await deleted.json(), {
      success: true,
      message: "Announcement deleted successfully",
    });

    Announcement.findById = () => ({
      populate() { return this; },
      then(resolve) { return Promise.resolve(null).then(resolve); },
    });
    for (const [method, path] of [
      ["GET", `/announcements/${id}`],
      ["PUT", `/announcements/${id}`],
      ["DELETE", `/announcements/${id}`],
    ]) {
      const missing = await request(method, path, method === "PUT" ? {} : undefined);
      assert.equal(missing.status, 404);
      assert.equal((await missing.json()).message, "Announcement not found");
    }

    Announcement.create = async () => { throw new Error("unexpected storage failure"); };
    const unexpected = await request("POST", "/announcements", {
      title: "Notice",
      message: "Message",
    });
    assert.equal(unexpected.status, 500);
    assert.equal((await unexpected.json()).success, false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    Announcement.create = originalCreate;
    Announcement.findById = originalFindById;
    Announcement.findByIdAndDelete = originalFindByIdAndDelete;
  }
});

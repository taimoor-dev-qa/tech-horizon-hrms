import test from "node:test";
import assert from "node:assert/strict";
import express from "express";

import Candidate from "../models/Candidate.js";
import Job from "../models/Job.js";
import { CANDIDATE_STATUS } from "../constants/recruitment.js";
import {
  changeCandidateStatus,
  createCandidate,
  getCandidateById,
  getCandidates,
  updateCandidate,
} from "../controllers/candidateController.js";
import errorHandler from "../middleware/errorMiddleware.js";

const id = "507f1f77bcf86cd799439011";
const input = { job: id, name: "Candidate", email: "candidate@example.test", phone: "123456789" };
const candidate = { _id: id, ...input, status: CANDIDATE_STATUS.APPLIED };

const withServer = async (run) => {
  const app = express();
  app.use(express.json());
  app.post("/candidates", createCandidate);
  app.get("/candidates", getCandidates);
  app.get("/candidates/:id", getCandidateById);
  app.put("/candidates/:id", updateCandidate);
  app.patch("/candidates/:id/status", changeCandidateStatus);
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
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    await run(request);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

test("candidate business, missing, duplicate, and unexpected errors reach centralized handling", async () => {
  const originals = {
    jobFindById: Job.findById,
    findOne: Candidate.findOne,
    create: Candidate.create,
    findById: Candidate.findById,
    findByIdAndUpdate: Candidate.findByIdAndUpdate,
    findOneAndUpdate: Candidate.findOneAndUpdate,
  };
  const openJob = {
    status: "open",
    vacancies: 1,
    filledPositions: 0,
    closingDate: null,
  };
  let foundCandidate = candidate;
  Job.findById = async () => openJob;
  Candidate.findOne = async () => null;
  Candidate.create = async () => candidate;
  Candidate.findById = () => ({
    populate: async () => foundCandidate,
    then(resolve, reject) {
      return Promise.resolve(foundCandidate).then(resolve, reject);
    },
  });
  Candidate.findByIdAndUpdate = async () => candidate;
  Candidate.findOneAndUpdate = async () => candidate;

  try {
    await withServer(async (request) => {
      const created = await request("POST", "/candidates", input);
      assert.equal(created.status, 201);
      assert.deepEqual(await created.json(), {
        success: true,
        message: "Candidate created successfully",
        candidate,
      });

      const retrieved = await request("GET", `/candidates/${id}`);
      assert.equal(retrieved.status, 200);
      assert.deepEqual(await retrieved.json(), { success: true, candidate });

      Job.findById = async () => null;
      const noJob = await request("POST", "/candidates", input);
      assert.equal(noJob.status, 400);
      assert.equal((await noJob.json()).message, "Job not found");

      Job.findById = async () => ({ status: "closed" });
      const closedJob = await request("POST", "/candidates", input);
      assert.equal(closedJob.status, 400);
      assert.equal((await closedJob.json()).message, "Candidate can only be added to an open job");

      Job.findById = async () => openJob;
      Candidate.findOne = async () => candidate;
      const existing = await request("POST", "/candidates", input);
      assert.equal(existing.status, 400);
      assert.equal((await existing.json()).message, "Candidate already exists for this job");

      Candidate.findOne = async () => null;
      Candidate.create = async () => {
        throw Object.assign(new Error("duplicate key"), {
          code: 11000,
          keyPattern: { job: 1, email: 1 },
        });
      };
      const racedDuplicate = await request("POST", "/candidates", input);
      assert.equal(racedDuplicate.status, 400);
      assert.equal((await racedDuplicate.json()).message, "Candidate already exists for this job");

      Candidate.create = async () => {
        throw Object.assign(new Error("other duplicate"), {
          code: 11000,
          keyPattern: { _id: 1 },
        });
      };
      const otherDuplicate = await request("POST", "/candidates", input);
      assert.equal(otherDuplicate.status, 409);

      Candidate.create = async () => { throw new Error("unexpected storage failure"); };
      const unexpected = await request("POST", "/candidates", input);
      assert.equal(unexpected.status, 500);
      assert.equal((await unexpected.json()).success, false);

      foundCandidate = null;
      const missingGet = await request("GET", `/candidates/${id}`);
      assert.equal(missingGet.status, 404);
      assert.equal((await missingGet.json()).message, "Candidate not found");

      Candidate.findByIdAndUpdate = async () => null;
      for (const [method, path, body] of [
        ["PUT", `/candidates/${id}`, { name: "Updated" }],
        ["PATCH", `/candidates/${id}/status`, { status: CANDIDATE_STATUS.SCREENING }],
      ]) {
        const missing = await request(method, path, body);
        assert.equal(missing.status, 404);
        assert.equal((await missing.json()).message, "Candidate not found");
      }

      const invalid = await request("PATCH", `/candidates/${id}/status`, { status: "invalid" });
      assert.equal(invalid.status, 400);
      assert.equal((await invalid.json()).message, "Invalid candidate status");

      const hired = await request("PATCH", `/candidates/${id}/status`, { status: CANDIDATE_STATUS.HIRED });
      assert.equal(hired.status, 400);
      assert.equal((await hired.json()).message, "Use the candidate hire endpoint to hire a candidate");

      Candidate.findByIdAndUpdate = async () => {
        throw Object.assign(new Error("duplicate key"), {
          code: 11000,
          keyValue: { job: id, email: input.email },
        });
      };
      const updateDuplicate = await request("PUT", `/candidates/${id}`, { email: input.email });
      assert.equal(updateDuplicate.status, 400);
      assert.equal((await updateDuplicate.json()).message, "Candidate already exists for this job");

      Candidate.findByIdAndUpdate = async () => candidate;
      foundCandidate = candidate;
      const updated = await request("PUT", `/candidates/${id}`, { name: "Updated" });
      assert.equal(updated.status, 200);
      assert.equal((await updated.json()).message, "Candidate updated successfully");
      const status = await request("PATCH", `/candidates/${id}/status`, { status: CANDIDATE_STATUS.SCREENING });
      assert.equal(status.status, 200);
      assert.equal((await status.json()).message, "Candidate status updated");
    });
  } finally {
    Job.findById = originals.jobFindById;
    Candidate.findOne = originals.findOne;
    Candidate.create = originals.create;
    Candidate.findById = originals.findById;
    Candidate.findByIdAndUpdate = originals.findByIdAndUpdate;
    Candidate.findOneAndUpdate = originals.findOneAndUpdate;
  }
});

test("candidate list returns results, empty pages, pagination, and filtered totals", async () => {
  const originalFind = Candidate.find;
  const originalCountDocuments = Candidate.countDocuments;
  let rows = [candidate];
  let total = 1;
  let observed;
  Candidate.find = (filter) => {
    observed = { filter };
    return {
      sort(value) { observed.sort = value; return this; },
      skip(value) { observed.skip = value; return this; },
      limit(value) { observed.limit = value; return this; },
      populate(value) { observed.populate = value; return Promise.resolve(rows); },
    };
  };
  Candidate.countDocuments = async (filter) => {
    observed.countFilter = filter;
    return total;
  };
  try {
    await withServer(async (request) => {
      const first = await request("GET", "/candidates");
      assert.equal(first.status, 200);
      assert.deepEqual(await first.json(), {
        success: true,
        count: 1,
        pagination: {
          page: 1, limit: 20, total: 1, totalPages: 1,
          hasNextPage: false, hasPrevPage: false,
        },
        candidates: [candidate],
      });
      assert.deepEqual(observed.sort, { createdAt: -1 });
      assert.equal(observed.skip, 0);
      assert.equal(observed.limit, 20);
      assert.equal(observed.populate.path, "job");

      rows = [];
      total = 0;
      const empty = await request("GET", "/candidates");
      assert.equal(empty.status, 200);
      assert.deepEqual(await empty.json(), {
        success: true,
        count: 0,
        pagination: {
          page: 1, limit: 20, total: 0, totalPages: 0,
          hasNextPage: false, hasPrevPage: false,
        },
        candidates: [],
      });

      rows = [candidate];
      total = 5;
      const filtered = await request("GET", `/candidates?job=${id}&status=screening&search=Ann&page=2&limit=2`);
      assert.equal(filtered.status, 200);
      assert.deepEqual(await filtered.json(), {
        success: true,
        count: 1,
        pagination: {
          page: 2, limit: 2, total: 5, totalPages: 3,
          hasNextPage: true, hasPrevPage: true,
        },
        candidates: [candidate],
      });
      assert.equal(observed.filter.job, id);
      assert.equal(observed.filter.status, "screening");
      assert.deepEqual(observed.filter.$or, ["name", "email", "phone"].map((field) => ({
        [field]: { $regex: "Ann", $options: "i" },
      })));
      assert.deepEqual(observed.countFilter, observed.filter);
      assert.equal(observed.skip, 2);
      assert.equal(observed.limit, 2);

      Candidate.find = () => ({
        sort() { return this; },
        skip() { return this; },
        limit() { return this; },
        populate() { return Promise.reject(new Error("unexpected query failure")); },
      });
      const failure = await request("GET", "/candidates");
      assert.equal(failure.status, 500);
      assert.equal((await failure.json()).success, false);
    });
  } finally {
    Candidate.find = originalFind;
    Candidate.countDocuments = originalCountDocuments;
  }
});

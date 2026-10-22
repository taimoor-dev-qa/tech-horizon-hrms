import test from "node:test";
import assert from "node:assert/strict";

import AppError from "../utils/AppError.js";
import Asset from "../models/Asset.js";
import Candidate from "../models/Candidate.js";
import CompanySettings from "../models/CompanySettings.js";
import Department from "../models/Department.js";
import Designation from "../models/Designation.js";
import Job from "../models/Job.js";
import Payroll from "../models/Payroll.js";
import Employee from "../models/Employee.js";
import SalaryStructure from "../models/SalaryStructure.js";
import Holiday from "../models/Holiday.js";
import Attendance from "../models/Attendance.js";
import LeaveRequest from "../models/LeaveRequest.js";
import Interview from "../models/Interview.js";
import User from "../models/User.js";

import {
  ASSET_STATUS,
} from "../constants/asset.js";
import {
  CANDIDATE_STATUS,
  JOB_STATUS,
} from "../constants/recruitment.js";
import {
  PAYROLL_STATUS,
} from "../constants/payroll.js";
import {
  INTERVIEW_MODES,
  INTERVIEW_TYPES,
} from "../constants/interview.js";

import {
  createAsset,
  updateAsset,
} from "../services/assetService.js";
import {
  createCandidate,
  updateCandidateStatus,
} from "../services/candidateService.js";
import {
  updateJob,
} from "../services/jobService.js";
import {
  getJobs,
} from "../services/jobQueryService.js";
import {
  createPayroll,
  recalculateDraftPayroll,
} from "../services/payrollService.js";
import {
  createInterview,
} from "../services/interviewService.js";
import {
  assetSchema,
} from "../validators/assetValidators.js";

const query = (value) => ({
  session() { return this; },
  populate() { return this; },
  select() { return this; },
  sort() { return this; },
  skip() { return this; },
  limit() { return this; },
  lean() { return Promise.resolve(value); },
  then(resolve, reject) {
    return Promise.resolve(value).then(resolve, reject);
  },
});

const operational = (
  message,
  statusCode = 400
) => (error) => {
  assert.equal(error instanceof AppError, true);
  assert.equal(error.statusCode, statusCode);
  assert.equal(error.message, message);
  return true;
};

test("asset status changes cannot bypass assignment and return workflows", async (t) => {
  let conditionalFilter;
  let conditionalResult = null;
  let existingAsset = {
    _id: "asset",
    status: ASSET_STATUS.ASSIGNED,
  };
  let ordinaryUpdate = {
    _id: "asset",
    name: "Updated asset",
    status: ASSET_STATUS.AVAILABLE,
  };

  t.mock.method(Asset, "findOne", async () => null);
  t.mock.method(Asset, "create", async (data) => data);
  t.mock.method(Asset, "findOneAndUpdate", async (filter) => {
    conditionalFilter = filter;
    return conditionalResult;
  });
  t.mock.method(Asset, "findById", async () => existingAsset);
  t.mock.method(Asset, "findByIdAndUpdate", async () => ordinaryUpdate);

  assert.equal(
    assetSchema.safeParse({
      assetTag: "LT-1",
      name: "Laptop",
      category: "laptop",
      status: ASSET_STATUS.ASSIGNED,
    }).success,
    false
  );

  await assert.rejects(
    createAsset({
      assetTag: "LT-1",
      status: ASSET_STATUS.ASSIGNED,
    }),
    operational(
      "Asset can only be marked assigned through the assignment workflow"
    )
  );

  await assert.rejects(
    updateAsset("asset", {
      status: ASSET_STATUS.ASSIGNED,
    }),
    operational(
      "Asset can only be marked assigned through the assignment workflow"
    )
  );

  await assert.rejects(
    updateAsset("asset", {
      status: ASSET_STATUS.REPAIR,
    }),
    operational(
      "Assigned asset status can only be changed through the return workflow"
    )
  );
  assert.deepEqual(
    conditionalFilter,
    {
      _id: "asset",
      status: {
        $ne: ASSET_STATUS.ASSIGNED,
      },
    }
  );

  conditionalResult = {
    _id: "asset",
    status: ASSET_STATUS.REPAIR,
  };
  existingAsset = null;
  assert.deepEqual(
    await updateAsset("asset", {
      status: ASSET_STATUS.REPAIR,
    }),
    conditionalResult
  );

  assert.deepEqual(
    await updateAsset("asset", {
      name: "Updated asset",
    }),
    ordinaryUpdate
  );
});

test("recruitment enforces deadlines, capacity, and forward-only candidate transitions", async (t) => {
  let job = {
    _id: "job",
    status: JOB_STATUS.OPEN,
    vacancies: 1,
    filledPositions: 1,
    closingDate: null,
  };
  let candidate = {
    _id: "candidate",
    status: CANDIDATE_STATUS.APPLIED,
    employee: null,
  };
  let candidateUpdateResult = candidate;
  let candidateUpdate;

  t.mock.method(
    CompanySettings,
    "findOne",
    () => query(null)
  );
  t.mock.method(Job, "findById", async () => job);
  t.mock.method(Candidate, "findOne", async () => null);
  t.mock.method(Candidate, "create", async (data) => ({
    ...data,
    status: CANDIDATE_STATUS.APPLIED,
  }));
  t.mock.method(Candidate, "findById", async () => candidate);
  t.mock.method(Candidate, "findOneAndUpdate", async (filter, update) => {
    candidateUpdate = { filter, update };
    return candidateUpdateResult;
  });

  await assert.rejects(
    createCandidate({
      job: "job",
      email: "candidate@example.test",
    }),
    operational(
      "No vacancies are available for this job"
    )
  );

  job = {
    ...job,
    vacancies: 2,
    filledPositions: 0,
    closingDate: "2000-01-01",
  };
  await assert.rejects(
    createCandidate({
      job: "job",
      email: "candidate@example.test",
    }),
    operational(
      "Job application deadline has passed"
    )
  );

  job = {
    ...job,
    closingDate: null,
  };
  const created = await createCandidate({
    job: "job",
    name: "Candidate",
    email: "candidate@example.test",
  });
  assert.equal(created.status, CANDIDATE_STATUS.APPLIED);

  candidate = {
    ...candidate,
    status: CANDIDATE_STATUS.OFFER,
  };
  await assert.rejects(
    updateCandidateStatus(
      "candidate",
      CANDIDATE_STATUS.SCREENING
    ),
    operational(
      "Candidate status cannot move backward"
    )
  );

  candidate = {
    ...candidate,
    employee: "employee",
  };
  await assert.rejects(
    updateCandidateStatus(
      "candidate",
      CANDIDATE_STATUS.REJECTED
    ),
    operational(
      "Hired candidate status cannot be changed"
    )
  );
  assert.equal(candidate.employee, "employee");

  candidate = {
    _id: "candidate",
    status: CANDIDATE_STATUS.REJECTED,
    employee: null,
  };
  await assert.rejects(
    updateCandidateStatus(
      "candidate",
      CANDIDATE_STATUS.SCREENING
    ),
    operational(
      "Rejected candidate status cannot be changed"
    )
  );

  candidate = {
    _id: "candidate",
    status: CANDIDATE_STATUS.APPLIED,
    employee: null,
  };
  candidateUpdateResult = {
    ...candidate,
    status: CANDIDATE_STATUS.OFFER,
  };
  const advanced =
    await updateCandidateStatus(
      "candidate",
      CANDIDATE_STATUS.OFFER,
      "Approved"
    );
  assert.equal(
    advanced.status,
    CANDIDATE_STATUS.OFFER
  );
  assert.deepEqual(candidateUpdate, {
    filter: {
      _id: "candidate",
      status: CANDIDATE_STATUS.APPLIED,
    },
    update: {
      $set: {
        status: CANDIDATE_STATUS.OFFER,
        notes: "Approved",
      },
    },
  });
  assert.equal(
    Object.hasOwn(
      candidateUpdate.update.$set,
      "employee"
    ),
    false
  );

  candidateUpdateResult = null;
  await assert.rejects(
    updateCandidateStatus(
      "candidate",
      CANDIDATE_STATUS.SCREENING
    ),
    operational(
      "Candidate status changed; retry the request",
      409
    )
  );
});

test("interview scheduling cannot move a candidate backward", async (t) => {
  let interviewCreates = 0;
  const candidate = {
    _id: "candidate",
    job: "job",
    status: CANDIDATE_STATUS.OFFER,
    employee: null,
    save: async () => candidate,
  };

  t.mock.method(
    Candidate,
    "findById",
    async () => candidate
  );
  t.mock.method(
    User,
    "findById",
    async () => ({
      _id: "interviewer",
      role: "manager",
    })
  );
  t.mock.method(Interview, "create", async () => {
    interviewCreates += 1;
    return {};
  });

  await assert.rejects(
    createInterview(
      {
        candidate: "candidate",
        interviewer: "interviewer",
        type: INTERVIEW_TYPES.TECHNICAL,
        mode: INTERVIEW_MODES.ONLINE,
        meetingLink: "https://example.test/interview",
        scheduledAt: "2099-01-01T10:00:00.000Z",
      },
      "actor"
    ),
    operational(
      "Candidate status cannot move backward"
    )
  );
  assert.equal(interviewCreates, 0);
  assert.equal(
    candidate.status,
    CANDIDATE_STATUS.OFFER
  );
});

test("job lifecycle rejects invalid openings and public queries exclude expired or full jobs", async (t) => {
  let job = {
    _id: "job",
    department: "department",
    designation: "designation",
    vacancies: 3,
    filledPositions: 2,
    status: JOB_STATUS.DRAFT,
    closingDate: null,
    save: async () => job,
  };
  let observedFilter;

  t.mock.method(
    CompanySettings,
    "findOne",
    () => query(null)
  );
  t.mock.method(Job, "findById", async () => job);
  t.mock.method(
    Department,
    "findById",
    async () => ({ _id: "department" })
  );
  t.mock.method(
    Designation,
    "findById",
    async () => ({
      _id: "designation",
      department: "department",
    })
  );
  t.mock.method(Job, "find", (filter) => {
    observedFilter = filter;
    return query([]);
  });
  t.mock.method(Job, "countDocuments", async () => 0);

  await assert.rejects(
    updateJob("job", { vacancies: 1 }),
    operational(
      "Vacancies cannot be less than filled positions"
    )
  );

  await assert.rejects(
    updateJob("job", {
      status: JOB_STATUS.OPEN,
      closingDate: "2000-01-01",
    }),
    operational(
      "Open job closing date cannot be in the past"
    )
  );

  job = {
    ...job,
    vacancies: 2,
    filledPositions: 2,
  };
  await assert.rejects(
    updateJob("job", {
      status: JOB_STATUS.OPEN,
      closingDate: null,
    }),
    operational(
      "A job without available vacancies cannot be opened"
    )
  );

  await getJobs(
    { role: "employee" },
    { search: "Engineer" }
  );
  assert.equal(
    observedFilter.status,
    JOB_STATUS.OPEN
  );
  assert.deepEqual(observedFilter.$expr, {
    $lt: ["$filledPositions", "$vacancies"],
  });
  assert.equal(
    observedFilter.$and[0].$or[0].closingDate,
    null
  );
  assert.equal(
    typeof observedFilter.$and[0].$or[1]
      .closingDate.$gte,
    "string"
  );
});

test("draft payroll recalculation refreshes values and never updates finalized payroll", async (t) => {
  const employee = {
    _id: "employee",
    joiningDate:
      new Date("1999-01-01T00:00:00Z"),
    status: "active",
    employmentEndDate: null,
    shift: {
      workingDays: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
      ],
    },
  };
  const salary = {
    _id: "new-salary",
    basicSalary: 2100,
    allowances: { housing: 210 },
    deductions: { tax: 100 },
    overtimeHourlyRate: 10,
  };
  const draft = {
    _id: "payroll",
    employee: "employee",
    month: "2000-01",
    status: PAYROLL_STATUS.DRAFT,
    overtimeHours: 1,
    bonus: 5,
    deductions: { other: 5 },
  };
  let payrollRead = draft;
  let secondPayrollRead = draft;
  let readCount = 0;
  let updateResult = { _id: "payroll" };
  let observedUpdate;
  let createdPayroll;

  t.mock.method(
    CompanySettings,
    "findOne",
    () => query(null)
  );
  t.mock.method(
    Employee,
    "findById",
    () => query(employee)
  );
  t.mock.method(
    SalaryStructure,
    "findOne",
    () => query(salary)
  );
  t.mock.method(Holiday, "distinct", async () => []);
  t.mock.method(
    Attendance,
    "find",
    () => query([])
  );
  t.mock.method(
    LeaveRequest,
    "find",
    () => query([])
  );
  t.mock.method(Payroll, "findById", async () => {
    readCount += 1;
    return readCount === 1
      ? payrollRead
      : secondPayrollRead;
  });
  t.mock.method(Payroll, "findOne", async () => null);
  t.mock.method(Payroll, "create", async (data) => {
    createdPayroll = data;
    return data;
  });
  t.mock.method(
    Payroll,
    "findOneAndUpdate",
    async (filter, update, options) => {
      observedUpdate = {
        filter,
        update,
        options,
      };
      return updateResult;
    }
  );

  await createPayroll(
    {
      employee: "employee",
      month: "2000-01",
      overtimeHours: 2,
      bonus: 50,
      otherDeduction: 25,
    },
    "actor"
  );
  assert.equal(createdPayroll.generatedBy, "actor");
  assert.equal(createdPayroll.netSalary, 2255);
  assert.equal(
    createdPayroll.status,
    undefined
  );

  await recalculateDraftPayroll(
    "payroll",
    {
      overtimeHours: 2,
      bonus: 50,
      otherDeduction: 25,
    }
  );
  assert.deepEqual(observedUpdate.filter, {
    _id: "payroll",
    status: PAYROLL_STATUS.DRAFT,
  });
  assert.equal(
    observedUpdate.update.$set.salaryStructure,
    "new-salary"
  );
  assert.equal(
    observedUpdate.update.$set.basicSalary,
    2100
  );
  assert.equal(
    observedUpdate.update.$set.overtimeAmount,
    20
  );
  assert.equal(
    observedUpdate.update.$set.bonus,
    50
  );
  assert.equal(
    observedUpdate.update.$set.deductions.other,
    25
  );
  assert.equal(
    observedUpdate.update.$set.netSalary,
    2255
  );
  assert.deepEqual(observedUpdate.options, {
    new: true,
    runValidators: true,
  });

  readCount = 0;
  payrollRead = {
    ...draft,
    status: PAYROLL_STATUS.GENERATED,
  };
  await assert.rejects(
    recalculateDraftPayroll("payroll"),
    operational(
      "Only draft payroll can be recalculated"
    )
  );

  readCount = 0;
  payrollRead = {
    ...draft,
    status: PAYROLL_STATUS.PAID,
  };
  await assert.rejects(
    recalculateDraftPayroll("payroll"),
    operational(
      "Only draft payroll can be recalculated"
    )
  );

  readCount = 0;
  payrollRead = draft;
  secondPayrollRead = {
    ...draft,
    status: PAYROLL_STATUS.GENERATED,
  };
  updateResult = null;
  await assert.rejects(
    recalculateDraftPayroll("payroll"),
    operational(
      "Only draft payroll can be recalculated"
    )
  );
});

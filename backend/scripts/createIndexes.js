import "dotenv/config";
import mongoose from "mongoose";

import connectDB
  from "../config/db.js";

import Announcement
  from "../models/Announcement.js";

import Asset
  from "../models/Asset.js";

import AssetAssignment
  from "../models/AssetAssignment.js";

import Attendance
  from "../models/Attendance.js";

import Candidate
  from "../models/Candidate.js";

import Employee
  from "../models/Employee.js";

import EmployeeDocument
  from "../models/EmployeeDocument.js";

import Interview
  from "../models/Interview.js";

import Job
  from "../models/Job.js";

import LeaveRequest
  from "../models/LeaveRequest.js";

import Notification
  from "../models/Notification.js";

import Payroll
  from "../models/Payroll.js";

import PerformanceReview
  from "../models/PerformanceReview.js";

import Project
  from "../models/Project.js";

import SalaryStructure
  from "../models/SalaryStructure.js";

import Timesheet
  from "../models/Timesheet.js";

const models = [
  Announcement,
  Asset,
  AssetAssignment,
  Attendance,
  Candidate,
  Employee,
  EmployeeDocument,
  Interview,
  Job,
  LeaveRequest,
  Notification,
  Payroll,
  PerformanceReview,
  Project,
  SalaryStructure,
  Timesheet,
];

const createIndexes =
  async () => {
    try {
      await connectDB();

      for (
        const Model
        of models
      ) {
        await Model.createIndexes();

        console.log(
          `Indexes ready: ${Model.modelName}`
        );
      }

      console.log(
        "All indexes created successfully"
      );
    } catch (error) {
      console.error(
        "Index creation failed:",
        error.message
      );

      process.exitCode = 1;
    } finally {
      await mongoose.connection.close();
    }
  };

createIndexes();
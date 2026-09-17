import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

// Security middleware
import {
  apiLimiter,
  authLimiter,
  securityHeaders,
} from "./middleware/securityMiddleware.js";

import notFound from "./middleware/notFoundMiddleware.js";
import errorHandler from "./middleware/errorMiddleware.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import designationRoutes from "./routes/designationRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";

import attendanceRoutes from "./routes/attendanceRoutes.js";
import attendanceAdminRoutes from "./routes/attendanceAdminRoutes.js";

import leaveTypeRoutes from "./routes/leaveTypeRoutes.js";
import leaveRequestRoutes from "./routes/leaveRequestRoutes.js";
import leaveApprovalRoutes from "./routes/leaveApprovalRoutes.js";
import leaveBalanceRoutes from "./routes/leaveBalanceRoutes.js";

import holidayRoutes from "./routes/holidayRoutes.js";

import projectRoutes from "./routes/projectRoutes.js";

import timesheetRoutes from "./routes/timesheetRoutes.js";
import timesheetApprovalRoutes from "./routes/timesheetApprovalRoutes.js";

import assetRoutes from "./routes/assetRoutes.js";
import assetAssignmentRoutes from "./routes/assetAssignmentRoutes.js";

import jobRoutes from "./routes/jobRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import candidateHireRoutes from "./routes/candidateHireRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";

import performanceRoutes from "./routes/performanceRoutes.js";

import salaryStructureRoutes from "./routes/salaryStructureRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";

import announcementRoutes from "./routes/announcementRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

import documentRoutes from "./routes/documentRoutes.js";

import reportRoutes from "./routes/reportRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

import companySettingsRoutes from "./routes/companySettingsRoutes.js";

// Load environment variables
dotenv.config();

// Database connection
await connectDB();

const app = express();

// Security headers
app.use(securityHeaders);

// CORS
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:5173",
    credentials: true,
  })
);

// Request body limits
app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

// General API rate limiter
app.use("/api", apiLimiter);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Tech Horizon HRMS API is running",
  });
});

// Authentication
app.use(
  "/api/auth",
  authLimiter,
  authRoutes
);

// Admin
app.use("/api/admin", adminRoutes);

// Organization
app.use("/api/departments", departmentRoutes);
app.use("/api/designations", designationRoutes);
app.use("/api/teams", teamRoutes);

// Employees
app.use("/api/employees", employeeRoutes);

// Shifts
app.use("/api/shifts", shiftRoutes);

// Attendance
app.use("/api/attendance", attendanceRoutes);
app.use(
  "/api/attendance/admin",
  attendanceAdminRoutes
);

// Leave Management
app.use("/api/leave-types", leaveTypeRoutes);
app.use("/api/leaves", leaveRequestRoutes);
app.use("/api/leave-balances", leaveBalanceRoutes);
app.use(
  "/api/leave-approvals",
  leaveApprovalRoutes
);

// Holidays
app.use("/api/holidays", holidayRoutes);

// Projects
app.use("/api/projects", projectRoutes);

// Timesheets
app.use("/api/timesheets", timesheetRoutes);
app.use(
  "/api/timesheet-approvals",
  timesheetApprovalRoutes
);

// Assets
app.use("/api/assets", assetRoutes);
app.use(
  "/api/asset-assignments",
  assetAssignmentRoutes
);

// Recruitment
app.use("/api/jobs", jobRoutes);

app.use("/api/candidates", candidateRoutes);
app.use(
  "/api/candidates",
  candidateHireRoutes
);

app.use("/api/interviews", interviewRoutes);

// Performance
app.use(
  "/api/performance",
  performanceRoutes
);

// Payroll
app.use(
  "/api/salary-structures",
  salaryStructureRoutes
);

app.use("/api/payroll", payrollRoutes);

// Announcements
app.use(
  "/api/announcements",
  announcementRoutes
);

// Notifications
app.use(
  "/api/notifications",
  notificationRoutes
);

// Employee Documents
app.use("/api/documents", documentRoutes);

// Reports
app.use("/api/reports", reportRoutes);

// Dashboards
app.use(
  "/api/dashboard",
  dashboardRoutes
);

// Company Settings
app.use(
  "/api/settings",
  companySettingsRoutes
);

// 404 handler
app.use(notFound);

// Central error handler
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});
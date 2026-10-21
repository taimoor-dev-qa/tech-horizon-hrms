import {
  getEmployeeReport,
} from "../services/employeeReportService.js";

import {
  getAttendanceReport,
} from "../services/attendanceReportService.js";

import {
  getLeaveReport,
} from "../services/leaveReportService.js";

import {
  getPayrollReport,
} from "../services/payrollReportService.js";

import {
  getRecruitmentReport,
} from "../services/recruitmentReportService.js";

import {
  getPerformanceReport,
} from "../services/performanceReportService.js";

import {
  getAssetReport,
} from "../services/assetReportService.js";

import asyncHandler from "../utils/asyncHandler.js";

const sendReport = (callback) => asyncHandler(async (req, res) => {
  const report = await callback(req.query);
  res.status(200).json({ success: true, ...report });
});

export const employeeReport = sendReport(getEmployeeReport);

export const attendanceReport = sendReport(getAttendanceReport);

export const leaveReport = sendReport(getLeaveReport);

export const payrollReport = sendReport(getPayrollReport);

export const recruitmentReport = sendReport(getRecruitmentReport);

export const performanceReport = sendReport(getPerformanceReport);

export const assetReport = sendReport(getAssetReport);
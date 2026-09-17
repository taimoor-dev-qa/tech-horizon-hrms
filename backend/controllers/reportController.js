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

const sendReport = async (
  res,
  callback
) => {
  try {
    const report = await callback();

    res.status(200).json({
      success: true,
      ...report,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const employeeReport = (
  req,
  res
) =>
  sendReport(res, () =>
    getEmployeeReport(req.query)
  );

export const attendanceReport = (
  req,
  res
) =>
  sendReport(res, () =>
    getAttendanceReport(req.query)
  );

export const leaveReport = (
  req,
  res
) =>
  sendReport(res, () =>
    getLeaveReport(req.query)
  );

export const payrollReport = (
  req,
  res
) =>
  sendReport(res, () =>
    getPayrollReport(req.query)
  );

export const recruitmentReport = (
  req,
  res
) =>
  sendReport(res, () =>
    getRecruitmentReport(req.query)
  );

export const performanceReport = (
  req,
  res
) =>
  sendReport(res, () =>
    getPerformanceReport(req.query)
  );

export const assetReport = (
  req,
  res
) =>
  sendReport(res, () =>
    getAssetReport(req.query)
  );
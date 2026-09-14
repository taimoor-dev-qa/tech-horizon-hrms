import Announcement from "../models/Announcement.js";
import Asset from "../models/Asset.js";
import Attendance from "../models/Attendance.js";
import Candidate from "../models/Candidate.js";
import Employee from "../models/Employee.js";
import Interview from "../models/Interview.js";
import Job from "../models/Job.js";
import LeaveRequest from "../models/LeaveRequest.js";
import Payroll from "../models/Payroll.js";
import PerformanceReview from "../models/PerformanceReview.js";

import {
  getCurrentDate,
} from "./attendanceTimeService.js";

export const getAdminDashboard = async () => {
  const today = getCurrentDate();
  const currentMonth = today.slice(0, 7);
  const now = new Date();

  const [
    totalEmployees,
    activeEmployees,
    attendance,
    pendingLeaves,
    openJobs,
    totalCandidates,
    upcomingInterviews,
    payrolls,
    assets,
    recentAnnouncements,
    performanceReviews,
  ] = await Promise.all([
    Employee.countDocuments(),

    Employee.countDocuments({
      status: "active",
    }),

    Attendance.find({
      attendanceDate: today,
    }).select("status"),

    LeaveRequest.countDocuments({
      status: {
        $in: [
          "pending_manager",
          "pending_hr",
        ],
      },
    }),

    Job.countDocuments({
      status: "open",
    }),

    Candidate.countDocuments(),

    Interview.countDocuments({
      status: "scheduled",
      scheduledAt: {
        $gte: now,
      },
    }),

    Payroll.find({
      month: currentMonth,
    }).select(
      "status grossSalary totalDeductions netSalary"
    ),

    Asset.find().select(
      "status"
    ),

    Announcement.find({
      status: "published",
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } },
      ],
    })
      .sort({
        publishedAt: -1,
      })
      .limit(5)
      .populate(
        "createdBy",
        "name email role"
      ),

    PerformanceReview.find({
      status: {
        $in: [
          "submitted",
          "acknowledged",
        ],
      },
    }).select("overallScore"),
  ]);

  const attendanceSummary = {
    present: 0,
    late: 0,
    absent: 0,
    halfDay: 0,
    onLeave: 0,
    workFromHome: 0,
  };

  attendance.forEach((record) => {
    if (record.status === "present") {
      attendanceSummary.present += 1;
    }

    if (record.status === "late") {
      attendanceSummary.late += 1;
    }

    if (record.status === "absent") {
      attendanceSummary.absent += 1;
    }

    if (record.status === "half_day") {
      attendanceSummary.halfDay += 1;
    }

    if (record.status === "on_leave") {
      attendanceSummary.onLeave += 1;
    }

    if (
      record.status === "work_from_home"
    ) {
      attendanceSummary.workFromHome += 1;
    }
  });

  const payrollSummary = {
    total: payrolls.length,
    draft: 0,
    generated: 0,
    paid: 0,
    grossSalary: 0,
    deductions: 0,
    netSalary: 0,
  };

  payrolls.forEach((payroll) => {
    if (
      Object.hasOwn(
        payrollSummary,
        payroll.status
      )
    ) {
      payrollSummary[
        payroll.status
      ] += 1;
    }

    payrollSummary.grossSalary +=
      payroll.grossSalary || 0;

    payrollSummary.deductions +=
      payroll.totalDeductions || 0;

    payrollSummary.netSalary +=
      payroll.netSalary || 0;
  });

  const assetSummary = {
    total: assets.length,
    available: 0,
    assigned: 0,
    repair: 0,
    lost: 0,
    retired: 0,
  };

  assets.forEach((asset) => {
    if (
      Object.hasOwn(
        assetSummary,
        asset.status
      )
    ) {
      assetSummary[asset.status] += 1;
    }
  });

  const totalPerformanceScore =
    performanceReviews.reduce(
      (sum, review) =>
        sum +
        Number(
          review.overallScore || 0
        ),
      0
    );

  const averagePerformance =
    performanceReviews.length
      ? Number(
          (
            totalPerformanceScore /
            performanceReviews.length
          ).toFixed(2)
        )
      : 0;

  return {
    date: today,

    employees: {
      total: totalEmployees,
      active: activeEmployees,
      inactive:
        totalEmployees -
        activeEmployees,
    },

    attendance: attendanceSummary,

    leaves: {
      pending: pendingLeaves,
    },

    recruitment: {
      openJobs,
      totalCandidates,
      upcomingInterviews,
    },

    payroll: {
      month: currentMonth,
      ...payrollSummary,
    },

    assets: assetSummary,

    performance: {
      totalReviews:
        performanceReviews.length,
      averageScore:
        averagePerformance,
    },

    recentAnnouncements,
  };
};
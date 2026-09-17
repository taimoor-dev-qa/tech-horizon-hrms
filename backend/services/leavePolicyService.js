import {
  LEAVE_STATUS,
} from "../constants/leave.js";

import {
  getCurrentDate,
} from "./attendanceTimeService.js";

import {
  getRuntimeCompanySettings,
} from "./companySettingsRuntimeService.js";

const pad = (value) =>
  String(value).padStart(2, "0");

export const getLeaveYear = (
  dateValue,
  startMonth = 1
) => {
  const [year, month] =
    dateValue.split("-").map(Number);

  return month >= startMonth
    ? year
    : year - 1;
};

export const getLeaveYearRange = (
  leaveYear,
  startMonth = 1
) => {
  const start = `${leaveYear}-${pad(
    startMonth
  )}-01`;

  const endYear =
    startMonth === 1
      ? leaveYear
      : leaveYear + 1;

  const endMonth =
    startMonth === 1
      ? 12
      : startMonth - 1;

  const lastDay = new Date(
    Date.UTC(
      endYear,
      endMonth,
      0
    )
  ).getUTCDate();

  const end =
    `${endYear}-${pad(
      endMonth
    )}-${pad(lastDay)}`;

  return {
    start,
    end,
  };
};

export const validateLeaveRequestPolicy =
  async (
    startDate,
    endDate
  ) => {
    const settings =
      await getRuntimeCompanySettings();

    const policy = settings.leave;

    const today = getCurrentDate(
      settings.timezone
    );

    if (
      !policy.allowPastDateRequest &&
      startDate < today
    ) {
      throw new Error(
        "Past date leave requests are not allowed"
      );
    }

    const startLeaveYear =
      getLeaveYear(
        startDate,
        policy.leaveYearStartMonth
      );

    const endLeaveYear =
      getLeaveYear(
        endDate,
        policy.leaveYearStartMonth
      );

    if (
      startLeaveYear !==
      endLeaveYear
    ) {
      throw new Error(
        "Leave request cannot span multiple leave years"
      );
    }

    return {
      policy,
      leaveYear: startLeaveYear,
      timezone: settings.timezone,
    };
  };

export const resolveInitialLeaveStatus = (
  employee,
  policy
) => {
  if (
    policy.managerApprovalRequired
  ) {
    if (employee.manager) {
      return LEAVE_STATUS.PENDING_MANAGER;
    }

    if (policy.hrApprovalRequired) {
      return LEAVE_STATUS.PENDING_HR;
    }

    throw new Error(
      "Manager approval is required but no manager is assigned to this employee"
    );
  }

  if (policy.hrApprovalRequired) {
    return LEAVE_STATUS.PENDING_HR;
  }

  return LEAVE_STATUS.APPROVED;
};
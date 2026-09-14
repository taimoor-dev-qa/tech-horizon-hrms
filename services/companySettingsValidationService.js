export const validateSettingsData = (
  data
) => {
  if (
    data.payroll?.payrollDay !== undefined &&
    (
      data.payroll.payrollDay < 1 ||
      data.payroll.payrollDay > 31
    )
  ) {
    throw new Error(
      "Payroll day must be between 1 and 31"
    );
  }

  if (
    data.leave?.leaveYearStartMonth !==
      undefined &&
    (
      data.leave.leaveYearStartMonth < 1 ||
      data.leave.leaveYearStartMonth > 12
    )
  ) {
    throw new Error(
      "Leave year start month must be between 1 and 12"
    );
  }

  if (
    data.attendance?.graceMinutes !==
      undefined &&
    data.attendance.graceMinutes < 0
  ) {
    throw new Error(
      "Grace minutes cannot be negative"
    );
  }
};
import {
  ATTENDANCE_STATUS,
} from "../constants/attendance.js";

const COMPANY_TIMEZONE = "Asia/Karachi";

export const getCurrentDate = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: COMPANY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
};

export const calculateLateMinutes = (
  checkIn,
  shift,
  attendanceDate
) => {
  const shiftStart = new Date(
    `${attendanceDate}T${shift.startTime}:00+05:00`
  );

  const allowedTime = new Date(
    shiftStart.getTime() +
      shift.graceMinutes * 60000
  );

  if (checkIn <= allowedTime) {
    return 0;
  }

  return Math.floor(
    (checkIn - shiftStart) / 60000
  );
};

export const getAttendanceStatus = (
  lateMinutes
) => {
  return lateMinutes > 0
    ? ATTENDANCE_STATUS.LATE
    : ATTENDANCE_STATUS.PRESENT;
};

export const calculateWorkingMinutes = (
  checkIn,
  checkOut
) => {
  return Math.max(
    Math.floor(
      (checkOut - checkIn) / 60000
    ),
    0
  );
};
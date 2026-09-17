import {
  ATTENDANCE_STATUS,
} from "../constants/attendance.js";

const DEFAULT_TIMEZONE =
  "Asia/Karachi";

const getTimeZoneOffset = (
  date,
  timeZone
) => {
  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      }
    ).formatToParts(date);

  const values = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      values[part.type] =
        Number(part.value);
    }
  });

  const zonedTime = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second
  );

  return zonedTime - date.getTime();
};

const createShiftStart = (
  attendanceDate,
  startTime,
  timeZone
) => {
  const [
    year,
    month,
    day,
  ] = attendanceDate
    .split("-")
    .map(Number);

  const [
    hour,
    minute,
  ] = startTime
    .split(":")
    .map(Number);

  const utcGuess = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      0
    )
  );

  const offset =
    getTimeZoneOffset(
      utcGuess,
      timeZone
    );

  return new Date(
    utcGuess.getTime() - offset
  );
};

export const getCurrentDate = (
  timeZone = DEFAULT_TIMEZONE
) => {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(new Date());
};

export const calculateLateMinutes = (
  checkIn,
  shift,
  attendanceDate,
  graceMinutes = 0,
  timeZone = DEFAULT_TIMEZONE
) => {
  const shiftStart =
    createShiftStart(
      attendanceDate,
      shift.startTime,
      timeZone
    );

  const allowedTime = new Date(
    shiftStart.getTime() +
      Number(graceMinutes) * 60000
  );

  if (checkIn <= allowedTime) {
    return 0;
  }

  return Math.floor(
    (
      checkIn.getTime() -
      allowedTime.getTime()
    ) /
      60000
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
      (
        checkOut.getTime() -
        checkIn.getTime()
      ) /
        60000
    ),
    0
  );
};
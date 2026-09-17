import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

const populateAttendance = (query) => {
  return query
    .populate({
      path: "employee",
      select: "employeeId department designation team user",
      populate: [
        {
          path: "user",
          select: "name email",
        },
        {
          path: "department",
          select: "name code",
        },
        {
          path: "designation",
          select: "name code",
        },
        {
          path: "team",
          select: "name code",
        },
      ],
    })
    .populate(
      "shift",
      "name code startTime endTime"
    );
};

const getEmployeeFilter = async ({
  employee,
  department,
}) => {
  if (employee) {
    return [employee];
  }

  if (!department) {
    return null;
  }

  const employees = await Employee.find({
    department,
  }).select("_id");

  return employees.map(
    (employeeRecord) => employeeRecord._id
  );
};

export const getAttendanceList = async ({
  date,
  employee,
  department,
  status,
  page = 1,
  limit = 20,
}) => {
  const filters = {};

  if (date) {
    filters.attendanceDate = date;
  }

  if (status) {
    filters.status = status;
  }

  const employeeIds = await getEmployeeFilter({
    employee,
    department,
  });

  if (employeeIds) {
    filters.employee = {
      $in: employeeIds,
    };
  }

  const currentPage = Math.max(
    Number(page) || 1,
    1
  );

  const pageSize = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const skip =
    (currentPage - 1) * pageSize;

  const [attendance, total] =
    await Promise.all([
      populateAttendance(
        Attendance.find(filters)
          .sort({
            attendanceDate: -1,
            checkIn: -1,
          })
          .skip(skip)
          .limit(pageSize)
      ),

      Attendance.countDocuments(filters),
    ]);

  return {
    attendance,
    pagination: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(
        total / pageSize
      ),
    },
  };
};

export const getAttendanceSummary = async (
  date
) => {
  const records = await Attendance.find({
    attendanceDate: date,
  }).select("status");

  const summary = {
    total: records.length,
    present: 0,
    late: 0,
    absent: 0,
    half_day: 0,
    on_leave: 0,
    work_from_home: 0,
  };

  records.forEach((record) => {
    if (
      Object.hasOwn(summary, record.status)
    ) {
      summary[record.status] += 1;
    }
  });

  return summary;
};
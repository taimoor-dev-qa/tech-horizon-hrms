import Employee from "../models/Employee.js";
import User from "../models/User.js";
import {
  applyEmployeeAccessScope,
  EMPLOYEE_DIRECTORY_FIELDS,
  hasFullEmployeeAccess,
} from "./employeeAccessService.js";

const populateEmployee = (query) => {
  return query
    .populate("user", "name email role isActive")
    .populate("department", "name code")
    .populate("designation", "name code")
    .populate("team", "name code")
    .populate("manager", "name email")
    .populate("teamLead", "name email")
    .populate("shift","name code startTime endTime graceMinutes")
};

export const getEmployees = async (
  actor,
  {
    search,
    department,
    status,
    page = 1,
    limit = 10,
  }
) => {
  const filters = {};

  if (department) {
    filters.department = department;
  }

  if (status) {
    filters.status = status;
  }

  if (search) {
    const regex = new RegExp(search.trim(), "i");

    const users = await User.find({
      $or: [
        { name: regex },
        { email: regex },
      ],
    }).select("_id");

    const searchFilters = [
      { employeeId: regex },
      {
        user: {
          $in: users.map((user) => user._id),
        },
      },
    ];

    if (hasFullEmployeeAccess(actor)) {
      searchFilters.push(
        { phone: regex },
        { cnic: regex }
      );
    }

    filters.$or = searchFilters;
  }

  const scopedFilters =
    applyEmployeeAccessScope(
      actor,
      filters
    );

  const currentPage = Math.max(Number(page) || 1, 1);

  const pageSize = Math.min(
    Math.max(Number(limit) || 10, 1),
    100
  );

  const skip = (currentPage - 1) * pageSize;

  let employeeQuery =
    Employee.find(scopedFilters);

  if (!hasFullEmployeeAccess(actor)) {
    employeeQuery = employeeQuery.select(
      EMPLOYEE_DIRECTORY_FIELDS
    );
  }

  const [employees, total] =
    await Promise.all([
      populateEmployee(
        employeeQuery
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageSize)
      ),
      Employee.countDocuments(
        scopedFilters
      ),
    ]);

  return {
    employees,
    pagination: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

export const getEmployeeById = async (id) => {
  return populateEmployee(
    Employee.findById(id)
  );
};

export const getEmployeeByUserId = async (
  userId
) => {
  return populateEmployee(
    Employee.findOne({ user: userId })
  );
};

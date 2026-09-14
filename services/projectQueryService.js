import Employee from "../models/Employee.js";
import Project from "../models/Project.js";

const populateProject = (query) => {
  return query
    .populate({
      path: "manager",
      select: "employeeId user designation",
      populate: [
        {
          path: "user",
          select: "name email",
        },
        {
          path: "designation",
          select: "name code",
        },
      ],
    })
    .populate({
      path: "members",
      select: "employeeId user designation",
      populate: [
        {
          path: "user",
          select: "name email",
        },
        {
          path: "designation",
          select: "name code",
        },
      ],
    });
};

export const getProjects = async ({
  status,
  priority,
  search,
} = {}) => {
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        code: {
          $regex: search,
          $options: "i",
        },
      },
      {
        client: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  return populateProject(
    Project.find(filter).sort({
      createdAt: -1,
    })
  );
};

export const getProjectById = async (id) => {
  return populateProject(
    Project.findById(id)
  );
};

export const getMyProjects = async (
  userId
) => {
  const employee = await Employee.findOne({
    user: userId,
  });

  if (!employee) {
    throw new Error(
      "Employee profile not found"
    );
  }

  return populateProject(
    Project.find({
      $or: [
        { manager: employee._id },
        { members: employee._id },
      ],
    }).sort({ createdAt: -1 })
  );
};
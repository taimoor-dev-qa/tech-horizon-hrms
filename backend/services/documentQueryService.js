import {
  buildPagination,
  getPagination,
} from "../utils/pagination.js";

import Employee from "../models/Employee.js";

import EmployeeDocument
  from "../models/EmployeeDocument.js";

import {
  DOCUMENT_VISIBILITY,
} from "../constants/document.js";

import {
  getRuntimeCompanySettings,
} from "./companySettingsRuntimeService.js";

import {
  getCurrentDate,
} from "./attendanceTimeService.js";

const populateDocument = (query) => {
  return query
    .populate({
      path: "employee",
      select:
        "employeeId user department designation",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate(
      "uploadedBy",
      "name email role"
    );
};

export const getDocuments =
  async ({
    employee,
    type,
    page,
    limit,
  } = {}) => {
    const filter = {
      isActive: true,
    };

    if (employee) {
      filter.employee =
        employee;
    }

    if (type) {
      filter.type =
        type;
    }

    const pagination =
      getPagination({
        page,
        limit,
      });

    const [
      documents,
      total,
    ] =
      await Promise.all([
        populateDocument(
          EmployeeDocument
            .find(filter)
            .sort({
              createdAt: -1,
            })
            .skip(
              pagination.skip
            )
            .limit(
              pagination.limit
            )
        ),

        EmployeeDocument
          .countDocuments(
            filter
          ),
      ]);

    return {
      documents,

      pagination:
        buildPagination(
          pagination.page,
          pagination.limit,
          total
        ),
    };
  };

export const getMyDocuments =
  async (
    userId,
    query = {}
  ) => {
    const employee =
      await Employee.findOne({
        user: userId,
      });

    if (!employee) {
      throw new Error(
        "Employee profile not found"
      );
    }

    const settings =
      await getRuntimeCompanySettings();

    const today =
      getCurrentDate(
        settings.timezone
      );

    const filter = {
      employee:
        employee._id,

      isActive: true,

      visibility:
        DOCUMENT_VISIBILITY
          .EMPLOYEE_VISIBLE,

      $or: [
        {
          expiresAt:
            null,
        },

        {
          expiresAt: {
            $gte: today,
          },
        },
      ],
    };

    const pagination =
      getPagination(
        query,
        20
      );

    const [
      documents,
      total,
    ] =
      await Promise.all([
        EmployeeDocument
          .find(filter)
          .sort({
            createdAt: -1,
          })
          .skip(
            pagination.skip
          )
          .limit(
            pagination.limit
          ),

        EmployeeDocument
          .countDocuments(
            filter
          ),
      ]);

    return {
      documents,

      pagination:
        buildPagination(
          pagination.page,
          pagination.limit,
          total
        ),
    };
  };

export const getDocumentById = async (
  id
) => {
  return populateDocument(
    EmployeeDocument.findById(id)
  );
};
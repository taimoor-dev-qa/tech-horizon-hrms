import Employee
  from "../models/Employee.js";

import PerformanceReview
  from "../models/PerformanceReview.js";

import {
  PERFORMANCE_STATUS,
} from "../constants/performance.js";

import {
  getAccessibleEmployeeIds,
  hasFullPerformanceAccess,
  canAccessPerformanceReview,
} from "./performanceAccessService.js";

import {
  buildPagination,
  getPagination,
} from "../utils/pagination.js";

const populateReview = (
  query
) => {
  return query
    .populate({
      path: "employee",

      select:
        "employeeId user department designation",

      populate: [
        {
          path: "user",
          select:
            "name email",
        },

        {
          path:
            "department",
          select:
            "name code",
        },

        {
          path:
            "designation",
          select:
            "name code",
        },
      ],
    })

    .populate(
      "reviewer",
      "name email role"
    );
};

export const getPerformanceReviews =
  async (
    actor,
    {
      employee,
      status,
      periodStart,
      periodEnd,
      page,
      limit,
    } = {}
  ) => {
    const baseFilter = {};

    if (employee) {
      baseFilter.employee =
        employee;
    }

    if (status) {
      baseFilter.status =
        status;
    }

    if (periodStart) {
      baseFilter.periodStart = {
        $gte:
          periodStart,
      };
    }

    if (periodEnd) {
      baseFilter.periodEnd = {
        $lte:
          periodEnd,
      };
    }

    const conditions = [];

    if (
      Object.keys(
        baseFilter
      ).length
    ) {
      conditions.push(
        baseFilter
      );
    }

    /*
     * Step 28A security.
     */
    if (
      !hasFullPerformanceAccess(
        actor
      )
    ) {
      const employeeIds =
        await getAccessibleEmployeeIds(
          actor
        );

      const accessConditions = [
        /*
         * User reviewer hai to
         * apni review access kar
         * sakta hai.
         */
        {
          reviewer:
            actor._id,
        },
      ];

      if (
        employeeIds.length
      ) {
        accessConditions.push({
          employee: {
            $in:
              employeeIds,
          },
        });
      }

      conditions.push({
        $or:
          accessConditions,
      });
    }

    let filter = {};

    if (
      conditions.length === 1
    ) {
      filter =
        conditions[0];
    }

    if (
      conditions.length > 1
    ) {
      filter = {
        $and:
          conditions,
      };
    }

    const pagination =
      getPagination({
        page,
        limit,
      });

    const [
      reviews,
      total,
    ] =
      await Promise.all([
        populateReview(
          PerformanceReview
            .find(filter)
            .sort({
              periodEnd: -1,
            })
            .skip(
              pagination.skip
            )
            .limit(
              pagination.limit
            )
        ),

        PerformanceReview
          .countDocuments(
            filter
          ),
      ]);

    return {
      reviews,

      pagination:
        buildPagination(
          pagination.page,
          pagination.limit,
          total
        ),
    };
  };

export const getPerformanceReviewById =
  async (
    actor,
    id
  ) => {
    const review =
      await PerformanceReview
        .findById(id);

    if (!review) {
      return null;
    }

    const allowed =
      await canAccessPerformanceReview(
        actor,
        review
      );

    if (!allowed) {
      const error =
        new Error(
          "You do not have access to this performance review"
        );

      error.statusCode =
        403;

      throw error;
    }

    return populateReview(
      PerformanceReview
        .findById(id)
    );
  };

export const getMyPerformanceReviews =
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

    const filter = {
      employee:
        employee._id,

      /*
       * Draft reviews employee
       * ko nahi dikhani.
       */
      status: {
        $in: [
          PERFORMANCE_STATUS
            .SUBMITTED,

          PERFORMANCE_STATUS
            .ACKNOWLEDGED,
        ],
      },
    };

    const pagination =
      getPagination(
        query,
        20
      );

    const [
      reviews,
      total,
    ] =
      await Promise.all([
        populateReview(
          PerformanceReview
            .find(filter)
            .sort({
              periodEnd: -1,
            })
            .skip(
              pagination.skip
            )
            .limit(
              pagination.limit
            )
        ),

        PerformanceReview
          .countDocuments(
            filter
          ),
      ]);

    return {
      reviews,

      pagination:
        buildPagination(
          pagination.page,
          pagination.limit,
          total
        ),
    };
  };
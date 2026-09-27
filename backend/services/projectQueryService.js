import Employee
  from "../models/Employee.js";

import Project
  from "../models/Project.js";

import {
  getProjectAccessCondition,
} from "./projectAccessService.js";

import {
  buildPagination,
  getPagination,
} from "../utils/pagination.js";

const populateProject = (
  query
) => {
  return query
    .populate({
      path: "manager",

      select:
        "employeeId user designation",

      populate: [
        {
          path: "user",
          select:
            "name email",
        },

        {
          path:
            "designation",
          select:
            "name code",
        },
      ],
    })

    .populate({
      path: "members",

      select:
        "employeeId user designation",

      populate: [
        {
          path: "user",
          select:
            "name email",
        },

        {
          path:
            "designation",
          select:
            "name code",
        },
      ],
    });
};

export const getProjects =
  async (
    actor,
    {
      status,
      priority,
      search,
      page,
      limit,
    } = {}
  ) => {
    const baseFilter = {};

    if (status) {
      baseFilter.status =
        status;
    }

    if (priority) {
      baseFilter.priority =
        priority;
    }

    if (search) {
      baseFilter.$or = [
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

    /*
     * Step 28B security.
     *
     * Super/HR:
     * all projects
     *
     * Other allowed users:
     * manager/member projects only.
     */
    const accessCondition =
      await getProjectAccessCondition(
        actor
      );

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

    if (
      accessCondition &&
      Object.keys(
        accessCondition
      ).length
    ) {
      conditions.push(
        accessCondition
      );
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
      projects,
      total,
    ] =
      await Promise.all([
        populateProject(
          Project
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

        Project
          .countDocuments(
            filter
          ),
      ]);

    return {
      projects,

      pagination:
        buildPagination(
          pagination.page,
          pagination.limit,
          total
        ),
    };
  };

export const getProjectById =
  async (
    actor,
    id
  ) => {
    /*
     * YE CURRENT STEP 28B
     * SECURITY VERSION HI
     * REHNI CHAHIYE.
     */

    const accessCondition =
      await getProjectAccessCondition(
        actor
      );

    const conditions = [
      {
        _id: id,
      },
    ];

    if (
      accessCondition &&
      Object.keys(
        accessCondition
      ).length
    ) {
      conditions.push(
        accessCondition
      );
    }

    const filter =
      conditions.length === 1
        ? conditions[0]
        : {
            $and:
              conditions,
          };

    return populateProject(
      Project.findOne(
        filter
      )
    );
  };

export const getMyProjects =
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
      $or: [
        {
          manager:
            employee._id,
        },

        {
          members:
            employee._id,
        },
      ],
    };

    const pagination =
      getPagination(
        query,
        20
      );

    const [
      projects,
      total,
    ] =
      await Promise.all([
        populateProject(
          Project
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

        Project
          .countDocuments(
            filter
          ),
      ]);

    return {
      projects,

      pagination:
        buildPagination(
          pagination.page,
          pagination.limit,
          total
        ),
    };
  };
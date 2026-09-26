import Asset
  from "../models/Asset.js";

import AssetAssignment
  from "../models/AssetAssignment.js";

import Employee
  from "../models/Employee.js";

import {
  buildPagination,
  getPagination,
} from "../utils/pagination.js";

export const getAssets =
  async ({
    search,
    category,
    status,
    page,
    limit,
  } = {}) => {
    const filter = {};

    if (category) {
      filter.category =
        category;
    }

    if (status) {
      filter.status =
        status;
    }

    if (search) {
      filter.$or = [
        {
          assetTag: {
            $regex: search,
            $options: "i",
          },
        },

        {
          name: {
            $regex: search,
            $options: "i",
          },
        },

        {
          serialNumber: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const pagination =
      getPagination({
        page,
        limit,
      });

    const [
      assets,
      total,
    ] =
      await Promise.all([
        Asset.find(filter)
          .sort({
            createdAt: -1,
          })
          .skip(
            pagination.skip
          )
          .limit(
            pagination.limit
          ),

        Asset.countDocuments(
          filter
        ),
      ]);

    return {
      assets,

      pagination:
        buildPagination(
          pagination.page,
          pagination.limit,
          total
        ),
    };
  };

export const getAssetById =
  async (id) => {
    return Asset.findById(
      id
    );
  };

export const getMyAssets =
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

      status:
        "assigned",
    };

    const pagination =
      getPagination(
        query,
        20
      );

    const [
      assets,
      total,
    ] =
      await Promise.all([
        AssetAssignment
          .find(filter)
          .populate("asset")
          .sort({
            assignedDate: -1,
          })
          .skip(
            pagination.skip
          )
          .limit(
            pagination.limit
          ),

        AssetAssignment
          .countDocuments(
            filter
          ),
      ]);

    return {
      assets,

      pagination:
        buildPagination(
          pagination.page,
          pagination.limit,
          total
        ),
    };
  };
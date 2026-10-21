import AppError from "../utils/AppError.js";
import Asset
  from "../models/Asset.js";

import AssetAssignment
  from "../models/AssetAssignment.js";

import Employee
  from "../models/Employee.js";

import {
  ASSET_CONDITION,
  ASSET_STATUS,
  ASSIGNMENT_STATUS,
} from "../constants/asset.js";

import runTransaction
  from "../utils/runTransaction.js";
import { mapDuplicateKeyError } from "../utils/mongoDuplicateKey.js";

export const assignAsset =
  async (
    data,
    assignedBy
  ) => {
    try {
      return await runTransaction(
        async (session) => {
          const employee =
            await Employee
              .findById(
                data.employee
              )
              .session(session);

          if (!employee) {
            throw new AppError("Employee not found", 400);
          }

        /*
         * Asset ko sirf tab assigned
         * mark karo jab woh abhi
         * AVAILABLE ho.
         *
         * Ye concurrent assignment
         * ko bhi protect karta hai.
         */
          const asset =
            await Asset.findOneAndUpdate(
              {
                _id: data.asset,

                status:
                  ASSET_STATUS.AVAILABLE,

                isActive: true,
              },

              {
                $set: {
                  status:
                    ASSET_STATUS.ASSIGNED,
                },
              },

              {
                new: true,
                runValidators: true,
                session,
              }
            );

          if (!asset) {
            const existingAsset =
              await Asset
                .findById(
                  data.asset
                )
                .session(session);

            if (!existingAsset) {
              throw new AppError("Asset not found", 400);
            }

            if (
              !existingAsset.isActive
            ) {
              throw new AppError("Inactive asset cannot be assigned", 400);
            }

            throw new AppError("Asset is not available", 400);
          }

          const assignments =
            await AssetAssignment.create(
              [
                {
                  asset:
                    asset._id,

                  employee:
                    employee._id,

                  assignedDate:
                    data.assignedDate,

                  assignedCondition:
                    asset.condition,

                  assignedBy,

                  notes:
                    data.notes || "",
                },
              ],
              {
                session,
              }
            );

          return assignments[0];
        }
      );
    } catch (error) {
      throw mapDuplicateKeyError(
        error,
        [
          {
            fields: ["asset"],
            message: "Asset is not available",
          },
        ]
      );
    }
  };

export const returnAsset =
  async (
    assignmentId,
    data
  ) => {
    return runTransaction(
      async (session) => {
        /*
         * Assignment ko atomically
         * assigned -> returned karo.
         *
         * Same assignment par
         * duplicate return request
         * successful nahi hogi.
         */
        const assignment =
          await AssetAssignment
            .findOneAndUpdate(
              {
                _id:
                  assignmentId,

                status:
                  ASSIGNMENT_STATUS
                    .ASSIGNED,
              },

              {
                $set: {
                  status:
                    ASSIGNMENT_STATUS
                      .RETURNED,

                  returnedDate:
                    data.returnedDate,

                  returnedCondition:
                    data.returnedCondition,

                  ...(data.notes !==
                  undefined
                    ? {
                        notes:
                          data.notes,
                      }
                    : {}),
                },
              },

              {
                new: true,
                runValidators: true,
                session,
              }
            );

        if (!assignment) {
          const existing =
            await AssetAssignment
              .findById(
                assignmentId
              )
              .session(
                session
              );

          if (!existing) {
            throw new AppError("Asset assignment not found", 400);
          }

          throw new AppError("Asset has already been returned", 400);
        }

        const asset =
          await Asset
            .findById(
              assignment.asset
            )
            .session(session);

        if (!asset) {
          throw new AppError("Assigned asset not found", 400);
        }

        asset.condition =
          data.returnedCondition;

        asset.status =
          data.returnedCondition ===
          ASSET_CONDITION.DAMAGED
            ? ASSET_STATUS.REPAIR
            : ASSET_STATUS.AVAILABLE;

        await asset.save({
          session,
        });

        return assignment;
      }
    );
  };

export const getAssignments =
  async () => {
    return AssetAssignment.find()
      .populate(
        "asset",
        "assetTag name category status"
      )
      .populate({
        path: "employee",

        select:
          "employeeId user",

        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate(
        "assignedBy",
        "name email role"
      )
      .sort({
        createdAt: -1,
      });
  };

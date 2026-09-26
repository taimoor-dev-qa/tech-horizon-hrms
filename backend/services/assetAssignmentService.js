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

export const assignAsset =
  async (
    data,
    assignedBy
  ) => {
    return runTransaction(
      async (session) => {
        const employee =
          await Employee
            .findById(
              data.employee
            )
            .session(session);

        if (!employee) {
          throw new Error(
            "Employee not found"
          );
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
            throw new Error(
              "Asset not found"
            );
          }

          if (
            !existingAsset.isActive
          ) {
            throw new Error(
              "Inactive asset cannot be assigned"
            );
          }

          throw new Error(
            "Asset is not available"
          );
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
            throw new Error(
              "Asset assignment not found"
            );
          }

          throw new Error(
            "Asset has already been returned"
          );
        }

        const asset =
          await Asset
            .findById(
              assignment.asset
            )
            .session(session);

        if (!asset) {
          throw new Error(
            "Assigned asset not found"
          );
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
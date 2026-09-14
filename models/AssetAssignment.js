import mongoose from "mongoose";

import {
  ASSET_CONDITION,
  ASSIGNMENT_STATUS,
} from "../constants/asset.js";

const assetAssignmentSchema =
  new mongoose.Schema(
    {
      asset: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Asset",
        required: true,
      },

      employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
      },

      assignedDate: {
        type: String,
        required: true,
      },

      returnedDate: {
        type: String,
        default: null,
      },

      assignedCondition: {
        type: String,
        enum: Object.values(ASSET_CONDITION),
        required: true,
      },

      returnedCondition: {
        type: String,
        enum: Object.values(ASSET_CONDITION),
        default: null,
      },

      status: {
        type: String,
        enum: Object.values(
          ASSIGNMENT_STATUS
        ),
        default:
          ASSIGNMENT_STATUS.ASSIGNED,
      },

      assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      notes: {
        type: String,
        trim: true,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

assetAssignmentSchema.index(
  {
    asset: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: "assigned",
    },
  }
);

const AssetAssignment = mongoose.model(
  "AssetAssignment",
  assetAssignmentSchema
);

export default AssetAssignment;
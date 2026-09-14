import mongoose from "mongoose";

import {
  ASSET_CATEGORY,
  ASSET_CONDITION,
  ASSET_STATUS,
} from "../constants/asset.js";

const assetSchema = new mongoose.Schema(
  {
    assetTag: {
      type: String,
      required: [true, "Asset tag is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: [true, "Asset name is required"],
      trim: true,
    },

    category: {
      type: String,
      enum: Object.values(ASSET_CATEGORY),
      required: true,
    },

    brand: {
      type: String,
      trim: true,
      default: "",
    },

    model: {
      type: String,
      trim: true,
      default: "",
    },

    serialNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      default: undefined,
    },

    condition: {
      type: String,
      enum: Object.values(ASSET_CONDITION),
      default: ASSET_CONDITION.GOOD,
    },

    status: {
      type: String,
      enum: Object.values(ASSET_STATUS),
      default: ASSET_STATUS.AVAILABLE,
    },

    purchaseDate: {
      type: String,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Asset = mongoose.model(
  "Asset",
  assetSchema
);

export default Asset;
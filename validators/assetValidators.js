import { z } from "zod";

import {
  ASSET_CATEGORY,
  ASSET_CONDITION,
  ASSET_STATUS,
} from "../constants/asset.js";

import {
  dateString,
  enumValue,
  objectId,
} from "./commonValidators.js";

export const assetSchema = z.object({
  assetTag: z
    .string()
    .trim()
    .min(2)
    .max(50),

  name: z
    .string()
    .trim()
    .min(2)
    .max(150),

  category: enumValue(
    Object.values(ASSET_CATEGORY),
    "Invalid asset category"
  ),

  brand: z
    .string()
    .trim()
    .max(100)
    .optional(),

  model: z
    .string()
    .trim()
    .max(100)
    .optional(),

  serialNumber: z
    .string()
    .trim()
    .max(150)
    .optional(),

  condition: enumValue(
    Object.values(ASSET_CONDITION),
    "Invalid asset condition"
  ).optional(),

  status: enumValue(
    Object.values(ASSET_STATUS),
    "Invalid asset status"
  ).optional(),

  purchaseDate:
    dateString.optional(),

  notes: z
    .string()
    .trim()
    .max(1000)
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

export const updateAssetSchema =
  assetSchema.partial();

export const assignAssetSchema =
  z.object({
    asset: objectId,

    employee: objectId,

    assignedDate: dateString,

    notes: z
      .string()
      .trim()
      .max(1000)
      .optional(),
  });

export const returnAssetSchema =
  z.object({
    returnedDate: dateString,

    returnedCondition: enumValue(
      Object.values(
        ASSET_CONDITION
      ),
      "Invalid returned condition"
    ),

    notes: z
      .string()
      .trim()
      .max(1000)
      .optional(),
  });
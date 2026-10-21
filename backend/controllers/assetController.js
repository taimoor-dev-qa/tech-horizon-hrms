import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createAsset as createService,
  deleteAsset as deleteService,
  updateAsset as updateService,
} from "../services/assetService.js";

import {
  getAssetById as getByIdService,
  getAssets as getAssetsService,
  getMyAssets as getMyAssetsService,
} from "../services/assetQueryService.js";

export const createAsset = asyncHandler(async (req, res) => {
  const asset = await createService(
    req.body
  );

  res.status(201).json({
    success: true,
    message: "Asset created successfully",
    asset,
  });
});

export const getAssets = asyncHandler(async (req, res) => {
  const result =
    await getAssetsService(
      req.query
    );

  res.status(200).json({
    success: true,

    count:
      result.assets.length,

    pagination:
      result.pagination,

    assets:
      result.assets,
  });
});

export const getMyAssets = asyncHandler(async (req, res) => {
  const result =
    await getMyAssetsService(
      req.user._id,
      req.query
    );

  res.status(200).json({
    success: true,

    count:
      result.assets.length,

    pagination:
      result.pagination,

    assets:
      result.assets,
  });
});

export const getAssetById = asyncHandler(async (req, res) => {
  const asset = await getByIdService(
    req.params.id
  );

  if (!asset) {
    throw new AppError("Asset not found", 404);
  }

  res.status(200).json({
    success: true,
    asset,
  });
});

export const updateAsset = asyncHandler(async (req, res) => {
  const asset = await updateService(
    req.params.id,
    req.body
  );

  if (!asset) {
    throw new AppError("Asset not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Asset updated successfully",
    asset,
  });
});

export const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await deleteService(
    req.params.id
  );

  if (!asset) {
    throw new AppError("Asset not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Asset deleted successfully",
  });
});

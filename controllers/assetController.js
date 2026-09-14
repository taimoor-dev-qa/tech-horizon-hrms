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

export const createAsset = async (
  req,
  res
) => {
  try {
    const asset = await createService(
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Asset created successfully",
      asset,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAssets = async (
  req,
  res
) => {
  try {
    const assets =
      await getAssetsService(req.query);

    res.status(200).json({
      success: true,
      count: assets.length,
      assets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyAssets = async (
  req,
  res
) => {
  try {
    const assets =
      await getMyAssetsService(
        req.user._id
      );

    res.status(200).json({
      success: true,
      count: assets.length,
      assets,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAssetById = async (
  req,
  res
) => {
  try {
    const asset = await getByIdService(
      req.params.id
    );

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    res.status(200).json({
      success: true,
      asset,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAsset = async (
  req,
  res
) => {
  try {
    const asset = await updateService(
      req.params.id,
      req.body
    );

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Asset updated successfully",
      asset,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteAsset = async (
  req,
  res
) => {
  try {
    const asset = await deleteService(
      req.params.id
    );

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Asset deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
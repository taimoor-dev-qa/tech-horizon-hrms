import asyncHandler from "../utils/asyncHandler.js";
import {
  getCompanySettings as getService,
  updateCompanySettings as updateService,
} from "../services/companySettingsService.js";

export const getCompanySettings = asyncHandler(async (req, res) => {
  const settings =
    await getService();

  res.status(200).json({
    success: true,
    settings,
  });
});

export const updateCompanySettings = asyncHandler(async (req, res) => {
  const settings =
    await updateService(
      req.body,
      req.user._id
    );

  res.status(200).json({
    success: true,
    message:
      "Company settings updated successfully",
    settings,
  });
});

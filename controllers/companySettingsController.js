import {
  getCompanySettings as getService,
  updateCompanySettings as updateService,
} from "../services/companySettingsService.js";

export const getCompanySettings =
  async (req, res) => {
    try {
      const settings =
        await getService();

      res.status(200).json({
        success: true,
        settings,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

export const updateCompanySettings =
  async (req, res) => {
    try {
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
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };
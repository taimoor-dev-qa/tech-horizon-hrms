import {
  createAnnouncement as createService,
  deleteAnnouncement as deleteService,
  updateAnnouncement as updateService,
} from "../services/announcementService.js";

import {
  getAnnouncementById as getByIdService,
  getAnnouncements as getAllService,
} from "../services/announcementQueryService.js";

export const createAnnouncement =
  async (req, res) => {
    try {
      const announcement =
        await createService(
          req.body,
          req.user._id
        );

      res.status(201).json({
        success: true,
        message:
          "Announcement created successfully",
        announcement,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

export const getAnnouncements =
  async (req, res) => {
    try {
      const announcements =
        await getAllService(req.query);

      res.status(200).json({
        success: true,
        count:
          announcements.length,
        announcements,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

export const getAnnouncementById =
  async (req, res) => {
    try {
      const announcement =
        await getByIdService(
          req.params.id
        );

      if (!announcement) {
        return res.status(404).json({
          success: false,
          message:
            "Announcement not found",
        });
      }

      res.status(200).json({
        success: true,
        announcement,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

export const updateAnnouncement =
  async (req, res) => {
    try {
      const announcement =
        await updateService(
          req.params.id,
          req.body
        );

      if (!announcement) {
        return res.status(404).json({
          success: false,
          message:
            "Announcement not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Announcement updated successfully",
        announcement,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

export const deleteAnnouncement =
  async (req, res) => {
    try {
      const announcement =
        await deleteService(
          req.params.id
        );

      if (!announcement) {
        return res.status(404).json({
          success: false,
          message:
            "Announcement not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Announcement deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };
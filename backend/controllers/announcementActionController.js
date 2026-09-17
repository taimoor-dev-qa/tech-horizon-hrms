import {
  archiveAnnouncement as archiveService,
  publishAnnouncement as publishService,
} from "../services/announcementService.js";

export const publishAnnouncement =
  async (req, res) => {
    try {
      const result =
        await publishService(
          req.params.id
        );

      res.status(200).json({
        success: true,
        message:
          "Announcement published successfully",
        announcement:
          result.announcement,
        notificationsCreated:
          result.recipientCount,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

export const archiveAnnouncement =
  async (req, res) => {
    try {
      const announcement =
        await archiveService(
          req.params.id
        );

      res.status(200).json({
        success: true,
        message:
          "Announcement archived successfully",
        announcement,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };
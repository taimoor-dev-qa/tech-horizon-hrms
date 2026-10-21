import asyncHandler from "../utils/asyncHandler.js";
import {
  archiveAnnouncement as archiveService,
  publishAnnouncement as publishService,
} from "../services/announcementService.js";

export const publishAnnouncement = asyncHandler(async (req, res) => {
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
});

export const archiveAnnouncement = asyncHandler(async (req, res) => {
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
});

import Announcement
  from "../models/Announcement.js";

import {
  ANNOUNCEMENT_STATUS,
} from "../constants/announcement.js";

import {
  validateAnnouncementTarget,
  validateExpiry,
} from "./announcementValidationService.js";

export const createAnnouncement =
  async (data, userId) => {
    await validateAnnouncementTarget(
      data
    );

    validateExpiry(data.expiresAt);

    return Announcement.create({
      ...data,
      status:
        ANNOUNCEMENT_STATUS.DRAFT,
      createdBy: userId,
    });
  };

export const updateAnnouncement =
  async (id, data) => {
    const announcement =
      await Announcement.findById(id);

    if (!announcement) {
      return null;
    }

    if (
      announcement.status !==
      ANNOUNCEMENT_STATUS.DRAFT
    ) {
      throw new Error(
        "Only draft announcements can be edited"
      );
    }

    const mergedData = {
      ...announcement.toObject(),
      ...data,
    };

    await validateAnnouncementTarget(
      mergedData
    );

    validateExpiry(
      mergedData.expiresAt
    );

    Object.assign(
      announcement,
      data
    );

    await announcement.save();

    return announcement;
  };

export const deleteAnnouncement =
  async (id) => {
    const announcement =
      await Announcement.findById(id);

    if (!announcement) {
      return null;
    }

    if (
      announcement.status ===
      ANNOUNCEMENT_STATUS.PUBLISHED
    ) {
      throw new Error(
        "Published announcement cannot be deleted"
      );
    }

    return Announcement.findByIdAndDelete(
      id
    );
  };
  import {
  getAnnouncementRecipients,
} from "./announcementTargetService.js";

import {
  createBulkNotifications,
} from "./notificationService.js";

import {
  NOTIFICATION_TYPE,
} from "../constants/notification.js";

export const publishAnnouncement =
  async (id) => {
    const announcement =
      await Announcement.findById(id);

    if (!announcement) {
      throw new Error(
        "Announcement not found"
      );
    }

    if (
      announcement.status !==
      ANNOUNCEMENT_STATUS.DRAFT
    ) {
      throw new Error(
        "Only draft announcement can be published"
      );
    }

    const recipients =
      await getAnnouncementRecipients(
        announcement
      );

    announcement.status =
      ANNOUNCEMENT_STATUS.PUBLISHED;

    announcement.publishedAt =
      new Date();

    await announcement.save();

    await createBulkNotifications(
      recipients,
      {
        type:
          NOTIFICATION_TYPE.ANNOUNCEMENT,

        title: announcement.title,

        message:
          announcement.message,

        referenceId:
          announcement._id,

        referenceType:
          "announcement",
      }
    );

    return {
      announcement,
      recipientCount:
        recipients.length,
    };
  };

export const archiveAnnouncement =
  async (id) => {
    const announcement =
      await Announcement.findById(id);

    if (!announcement) {
      throw new Error(
        "Announcement not found"
      );
    }

    announcement.status =
      ANNOUNCEMENT_STATUS.ARCHIVED;

    await announcement.save();

    return announcement;
  };
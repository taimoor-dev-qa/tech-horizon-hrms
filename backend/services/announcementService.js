import Announcement
  from "../models/Announcement.js";

import {
  ANNOUNCEMENT_STATUS,
} from "../constants/announcement.js";

import {
  NOTIFICATION_TYPE,
} from "../constants/notification.js";

import {
  validateAnnouncementTarget,
  validateExpiry,
} from "./announcementValidationService.js";

import {
  getAnnouncementRecipients,
} from "./announcementTargetService.js";

import {
  createBulkNotifications,
} from "./notificationService.js";

import runTransaction
  from "../utils/runTransaction.js";

export const createAnnouncement =
  async (
    data,
    userId
  ) => {
    await validateAnnouncementTarget(
      data
    );

    validateExpiry(
      data.expiresAt
    );

    return Announcement.create({
      ...data,

      status:
        ANNOUNCEMENT_STATUS.DRAFT,

      createdBy:
        userId,
    });
  };

export const updateAnnouncement =
  async (
    id,
    data
  ) => {
    const announcement =
      await Announcement.findById(
        id
      );

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
      await Announcement.findById(
        id
      );

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

    return Announcement
      .findByIdAndDelete(id);
  };

export const publishAnnouncement =
  async (id) => {
    return runTransaction(
      async (session) => {
        /*
         * Draft condition query mein hi
         * rakhne se concurrent publish
         * attempts bhi protected hain.
         */
        const announcement =
          await Announcement
            .findOne({
              _id: id,

              status:
                ANNOUNCEMENT_STATUS
                  .DRAFT,
            })
            .session(session);

        if (!announcement) {
          const existing =
            await Announcement
              .findById(id)
              .session(session);

          if (!existing) {
            throw new Error(
              "Announcement not found"
            );
          }

          throw new Error(
            "Only draft announcement can be published"
          );
        }

        const recipients =
          await getAnnouncementRecipients(
            announcement,
            session
          );

        announcement.status =
          ANNOUNCEMENT_STATUS
            .PUBLISHED;

        announcement.publishedAt =
          new Date();

        await announcement.save({
          session,
        });

        const notifications =
          await createBulkNotifications(
            recipients,
            {
              type:
                NOTIFICATION_TYPE
                  .ANNOUNCEMENT,

              title:
                announcement.title,

              message:
                announcement.message,

              referenceId:
                announcement._id,

              referenceType:
                "announcement",
            },

            session
          );

        return {
          announcement,

          recipientCount:
            notifications.length,
        };
      }
    );
  };

export const archiveAnnouncement =
  async (id) => {
    const announcement =
      await Announcement.findById(
        id
      );

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
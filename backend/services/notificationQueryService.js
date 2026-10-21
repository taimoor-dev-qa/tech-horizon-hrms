import Notification
  from "../models/Notification.js";
import { buildPagination, getPagination } from "../utils/pagination.js";

export const getMyNotifications =
  async (
    userId,
    { unreadOnly, page, limit } = {}
  ) => {
    const filter = {
      recipient: userId,
    };

    if (
      unreadOnly === "true"
    ) {
      filter.isRead = false;
    }

    const pagination = getPagination({ page, limit });
    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Notification.countDocuments(filter),
    ]);
    return {
      notifications,
      pagination: buildPagination(pagination.page, pagination.limit, total),
    };
  };

export const markNotificationRead =
  async (id, userId) => {
    return Notification.findOneAndUpdate(
      {
        _id: id,
        recipient: userId,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
      {
        new: true,
      }
    );
  };

export const markAllNotificationsRead =
  async (userId) => {
    const result =
      await Notification.updateMany(
        {
          recipient: userId,
          isRead: false,
        },
        {
          isRead: true,
          readAt: new Date(),
        }
      );

    return result.modifiedCount;
  };

export const getUnreadCount = async (
  userId
) => {
  return Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });
};

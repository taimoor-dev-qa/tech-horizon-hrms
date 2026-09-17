import Notification
  from "../models/Notification.js";

export const getMyNotifications =
  async (
    userId,
    { unreadOnly } = {}
  ) => {
    const filter = {
      recipient: userId,
    };

    if (
      unreadOnly === "true"
    ) {
      filter.isRead = false;
    }

    return Notification.find(filter)
      .sort({
        createdAt: -1,
      });
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
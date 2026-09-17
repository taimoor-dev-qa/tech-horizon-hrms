import Notification
  from "../models/Notification.js";

export const createNotification = async (
  data
) => {
  return Notification.create(data);
};

export const createBulkNotifications =
  async (recipientIds, data) => {
    const uniqueRecipients = [
      ...new Set(
        recipientIds.map(String)
      ),
    ];

    if (!uniqueRecipients.length) {
      return [];
    }

    const notifications =
      uniqueRecipients.map(
        (recipient) => ({
          recipient,
          ...data,
        })
      );

    return Notification.insertMany(
      notifications
    );
  };
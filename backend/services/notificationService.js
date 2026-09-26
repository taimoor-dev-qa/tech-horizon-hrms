import Notification
  from "../models/Notification.js";

export const createNotification =
  async (
    data,
    session = null
  ) => {
    if (!session) {
      return Notification.create(
        data
      );
    }

    const notifications =
      await Notification.create(
        [data],
        {
          session,
        }
      );

    return notifications[0];
  };

export const createBulkNotifications =
  async (
    recipientIds,
    data,
    session = null
  ) => {
    const uniqueRecipients = [
      ...new Set(
        recipientIds.map(
          (recipient) =>
            String(recipient)
        )
      ),
    ];

    if (
      !uniqueRecipients.length
    ) {
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
      notifications,
      session
        ? { session }
        : {}
    );
  };
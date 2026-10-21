import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getMyNotifications as getMyService,
  getUnreadCount as countService,
  markAllNotificationsRead as markAllService,
  markNotificationRead as markReadService,
} from "../services/notificationQueryService.js";

export const getMyNotifications = asyncHandler(async (req, res) => {
  const result =
    await getMyService(
      req.user._id,
      req.query
    );

  return res.status(200).json({
    success: true,

    count:
      result
        .notifications
        .length,

    pagination:
      result.pagination,

    notifications:
      result.notifications,
  });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await countService(
    req.user._id
  );

  res.status(200).json({
    success: true,
    unreadCount: count,
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification =
    await markReadService(
      req.params.id,
      req.user._id
    );

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  res.status(200).json({
    success: true,
    notification,
  });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const count =
    await markAllService(
      req.user._id
    );

  res.status(200).json({
    success: true,
    message:
      "Notifications marked as read",
    updated: count,
  });
});

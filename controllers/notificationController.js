import {
  getMyNotifications as getMyService,
  getUnreadCount as countService,
  markAllNotificationsRead as markAllService,
  markNotificationRead as markReadService,
} from "../services/notificationQueryService.js";

export const getMyNotifications =
  async (req, res) => {
    try {
      const notifications =
        await getMyService(
          req.user._id,
          req.query
        );

      res.status(200).json({
        success: true,
        count:
          notifications.length,
        notifications,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

export const getUnreadCount =
  async (req, res) => {
    try {
      const count = await countService(
        req.user._id
      );

      res.status(200).json({
        success: true,
        unreadCount: count,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

export const markAsRead =
  async (req, res) => {
    try {
      const notification =
        await markReadService(
          req.params.id,
          req.user._id
        );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      res.status(200).json({
        success: true,
        notification,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

export const markAllAsRead =
  async (req, res) => {
    try {
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
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };
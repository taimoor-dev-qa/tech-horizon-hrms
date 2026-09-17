import express from "express";

import {
  getMyNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "../controllers/notificationController.js";

import protect
  from "../middleware/authMiddleware.js";

import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

const router = express.Router();

router.get(
  "/my",
  protect,
  getMyNotifications
);

router.get(
  "/unread-count",
  protect,
  getUnreadCount
);

router.patch(
  "/read-all",
  protect,
  markAllAsRead
);

router.patch(
  "/:id/read",
  protect,
  validateObjectId("id"),
  markAsRead
);

export default router;
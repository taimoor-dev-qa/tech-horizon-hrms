import express from "express";

import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  getAnnouncements,
  updateAnnouncement,
} from "../controllers/announcementController.js";

import {
  archiveAnnouncement,
  publishAnnouncement,
} from "../controllers/announcementActionController.js";

import protect
  from "../middleware/authMiddleware.js";

import authorizeRoles
  from "../middleware/roleMiddleware.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

const hrAccess = authorizeRoles(
  ROLES.SUPER_ADMIN,
  ROLES.HR_ADMIN
);

router.get(
  "/",
  protect,
  hrAccess,
  getAnnouncements
);

router.post(
  "/",
  protect,
  hrAccess,
  createAnnouncement
);

router.get(
  "/:id",
  protect,
  hrAccess,
  getAnnouncementById
);

router.put(
  "/:id",
  protect,
  hrAccess,
  updateAnnouncement
);

router.patch(
  "/:id/publish",
  protect,
  hrAccess,
  publishAnnouncement
);

router.patch(
  "/:id/archive",
  protect,
  hrAccess,
  archiveAnnouncement
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN
  ),
  deleteAnnouncement
);

export default router;
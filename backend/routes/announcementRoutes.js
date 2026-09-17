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

import validateRequest
  from "../middleware/validateRequest.js";

import {
  validateObjectId,
} from "../middleware/validateObjectId.js";

import {
  announcementSchema,
  updateAnnouncementSchema,
} from "../validators/announcementValidators.js";

import ROLES
  from "../constants/roles.js";

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
  validateRequest(
    announcementSchema
  ),
  createAnnouncement
);

router.get(
  "/:id",
  protect,
  hrAccess,
  validateObjectId("id"),
  getAnnouncementById
);

router.put(
  "/:id",
  protect,
  hrAccess,
  validateObjectId("id"),
  validateRequest(
    updateAnnouncementSchema
  ),
  updateAnnouncement
);

router.patch(
  "/:id/publish",
  protect,
  hrAccess,
  validateObjectId("id"),
  publishAnnouncement
);

router.patch(
  "/:id/archive",
  protect,
  hrAccess,
  validateObjectId("id"),
  archiveAnnouncement
);

router.delete(
  "/:id",
  protect,
  authorizeRoles(
    ROLES.SUPER_ADMIN
  ),
  validateObjectId("id"),
  deleteAnnouncement
);

export default router;
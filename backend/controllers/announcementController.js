import {
  createAnnouncement as createService,
  deleteAnnouncement as deleteService,
  updateAnnouncement as updateService,
} from "../services/announcementService.js";

import {
  getAnnouncementById as getByIdService,
  getAnnouncements as getAllService,
} from "../services/announcementQueryService.js";

import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

export const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await createService(req.body, req.user._id);

  res.status(201).json({
    success: true,
    message: "Announcement created successfully",
    announcement,
  });
});

export const getAnnouncements = asyncHandler(async (req, res) => {
  const result = await getAllService(req.query);

  res.status(200).json({
    success: true,
    count: result.announcements.length,
    pagination: result.pagination,
    announcements: result.announcements,
  });
});

export const getAnnouncementById = asyncHandler(async (req, res) => {
  const announcement = await getByIdService(req.params.id);

  if (!announcement) {
    throw new AppError("Announcement not found", 404);
  }

  res.status(200).json({
    success: true,
    announcement,
  });
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await updateService(req.params.id, req.body);

  if (!announcement) {
    throw new AppError("Announcement not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Announcement updated successfully",
    announcement,
  });
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await deleteService(req.params.id);

  if (!announcement) {
    throw new AppError("Announcement not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Announcement deleted successfully",
  });
});

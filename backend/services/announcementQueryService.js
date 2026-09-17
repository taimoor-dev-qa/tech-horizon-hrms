import Announcement
  from "../models/Announcement.js";

export const getAnnouncements =
  async ({
    status,
    priority,
    audience,
  } = {}) => {
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (audience) {
      filter.audience = audience;
    }

    return Announcement.find(filter)
      .populate(
        "department",
        "name code"
      )
      .populate(
        "team",
        "name code"
      )
      .populate(
        "createdBy",
        "name email role"
      )
      .sort({
        createdAt: -1,
      });
  };

export const getAnnouncementById =
  async (id) => {
    return Announcement.findById(id)
      .populate(
        "department",
        "name code"
      )
      .populate(
        "team",
        "name code"
      )
      .populate(
        "createdBy",
        "name email role"
      );
  };
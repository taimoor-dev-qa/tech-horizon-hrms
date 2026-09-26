import Announcement
  from "../models/Announcement.js";

import {
  buildPagination,
  getPagination,
} from "../utils/pagination.js";

const populateAnnouncement = (
  query
) => {
  return query
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

export const getAnnouncements =
  async ({
    status,
    priority,
    audience,
    page,
    limit,
  } = {}) => {
    const filter = {};

    if (status) {
      filter.status =
        status;
    }

    if (priority) {
      filter.priority =
        priority;
    }

    if (audience) {
      filter.audience =
        audience;
    }

    const pagination =
      getPagination({
        page,
        limit,
      });

    const [
      announcements,
      total,
    ] =
      await Promise.all([
        populateAnnouncement(
          Announcement
            .find(filter)
            .sort({
              createdAt: -1,
            })
            .skip(
              pagination.skip
            )
            .limit(
              pagination.limit
            )
        ),

        Announcement
          .countDocuments(
            filter
          ),
      ]);

    return {
      announcements,

      pagination:
        buildPagination(
          pagination.page,
          pagination.limit,
          total
        ),
    };
  };

export const getAnnouncementById =
  async (id) => {
    return populateAnnouncement(
      Announcement.findById(
        id
      )
    );
  };
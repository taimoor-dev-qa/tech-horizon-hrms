import mongoose from "mongoose";

import {
  ANNOUNCEMENT_AUDIENCE,
  ANNOUNCEMENT_PRIORITY,
  ANNOUNCEMENT_STATUS,
} from "../constants/announcement.js";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    audience: {
      type: String,
      enum: Object.values(ANNOUNCEMENT_AUDIENCE),
      default: ANNOUNCEMENT_AUDIENCE.ALL,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },

    roles: {
      type: [String],
      default: [],
    },

    priority: {
      type: String,
      enum: Object.values(ANNOUNCEMENT_PRIORITY),
      default: ANNOUNCEMENT_PRIORITY.NORMAL,
    },

    status: {
      type: String,
      enum: Object.values(ANNOUNCEMENT_STATUS),
      default: ANNOUNCEMENT_STATUS.DRAFT,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Announcement = mongoose.model(
  "Announcement",
  announcementSchema
);

export default Announcement;
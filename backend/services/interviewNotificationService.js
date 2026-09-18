import {
  NOTIFICATION_TYPE,
} from "../constants/notification.js";

import {
  createNotification,
} from "./notificationService.js";

const safelyNotify = async (
  data
) => {
  try {
    return await createNotification(
      data
    );
  } catch (error) {
    console.error(
      `Interview notification error: ${error.message}`
    );

    return null;
  }
};

const getInterviewerId = (
  interview
) => {
  return (
    interview.interviewer?._id ||
    interview.interviewer
  );
};

export const notifyInterviewScheduled =
  async (interview) => {
    const recipient =
      getInterviewerId(interview);

    if (!recipient) {
      return;
    }

    await safelyNotify({
      recipient,

      type:
        NOTIFICATION_TYPE.INTERVIEW,

      title:
        "Interview scheduled",

      message:
        "A new interview has been assigned to you.",

      referenceId:
        interview._id,

      referenceType:
        "Interview",
    });
  };

export const notifyInterviewCancelled =
  async (interview) => {
    const recipient =
      getInterviewerId(interview);

    if (!recipient) {
      return;
    }

    await safelyNotify({
      recipient,

      type:
        NOTIFICATION_TYPE.INTERVIEW,

      title:
        "Interview cancelled",

      message:
        "An interview assigned to you has been cancelled.",

      referenceId:
        interview._id,

      referenceType:
        "Interview",
    });
  };
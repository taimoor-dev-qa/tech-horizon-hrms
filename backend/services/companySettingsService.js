import CompanySettings
  from "../models/CompanySettings.js";

import {
  validateSettingsData,
} from "./companySettingsValidationService.js";

export const getCompanySettings =
  async () => {
    let settings =
      await CompanySettings.findOne()
        .populate(
          "updatedBy",
          "name email role"
        );

    if (!settings) {
      settings =
        await CompanySettings.create({});
    }

    return settings;
  };

export const updateCompanySettings =
  async (data, userId) => {
    validateSettingsData(data);

    let settings =
      await CompanySettings.findOne();

    if (!settings) {
      settings =
        await CompanySettings.create({});
    }

    const simpleFields = [
      "companyName",
      "companyEmail",
      "companyPhone",
      "address",
      "website",
      "timezone",
      "currency",
    ];

    simpleFields.forEach((field) => {
      if (
        Object.hasOwn(data, field)
      ) {
        settings[field] = data[field];
      }
    });

    if (data.attendance) {
      Object.assign(
        settings.attendance,
        data.attendance
      );
    }

    if (data.payroll) {
      Object.assign(
        settings.payroll,
        data.payroll
      );
    }

    if (data.leave) {
      Object.assign(
        settings.leave,
        data.leave
      );
    }

    settings.updatedBy = userId;

    await settings.save();

    return settings.populate(
      "updatedBy",
      "name email role"
    );
  };
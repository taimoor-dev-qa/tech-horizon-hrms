import * as holidayService
  from "../services/holidayService.js";

export const createHoliday = async (
  req,
  res
) => {
  try {
    const holiday =
      await holidayService.createHoliday(
        req.body
      );

    res.status(201).json({
      success: true,
      message: "Holiday created successfully",
      holiday,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getHolidays = async (
  req,
  res
) => {
  try {
    const holidays =
      await holidayService.getHolidays(
        req.query
      );

    res.status(200).json({
      success: true,
      count: holidays.length,
      holidays,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateHoliday = async (
  req,
  res
) => {
  try {
    const holiday =
      await holidayService.updateHoliday(
        req.params.id,
        req.body
      );

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Holiday updated successfully",
      holiday,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteHoliday = async (
  req,
  res
) => {
  try {
    const holiday =
      await holidayService.deleteHoliday(
        req.params.id
      );

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Holiday deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
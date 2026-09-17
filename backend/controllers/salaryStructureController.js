import {
  createSalaryStructure as createService,
  deactivateSalaryStructure as deactivateService,
  getSalaryByEmployee as getByEmployeeService,
  getSalaryStructures as getAllService,
} from "../services/salaryStructureService.js";

export const createSalaryStructure =
  async (req, res) => {
    try {
      const salary = await createService(
        req.body,
        req.user._id
      );

      res.status(201).json({
        success: true,
        message:
          "Salary structure created successfully",
        salary,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

export const getSalaryStructures =
  async (req, res) => {
    try {
      const salaries =
        await getAllService();

      res.status(200).json({
        success: true,
        count: salaries.length,
        salaries,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

export const getSalaryByEmployee =
  async (req, res) => {
    try {
      const salary =
        await getByEmployeeService(
          req.params.employeeId
        );

      if (!salary) {
        return res.status(404).json({
          success: false,
          message:
            "Salary structure not found",
        });
      }

      res.status(200).json({
        success: true,
        salary,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

export const deactivateSalary =
  async (req, res) => {
    try {
      const salary =
        await deactivateService(
          req.params.id,
          req.body.effectiveTo
        );

      if (!salary) {
        return res.status(404).json({
          success: false,
          message:
            "Salary structure not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Salary structure deactivated",
        salary,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };
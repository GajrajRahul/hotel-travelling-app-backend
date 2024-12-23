import { validationResult } from "express-validator";
import crypto from "crypto";

import HttpException from "../utils/HttpException.utils.js";
import EmployeeModel from "../models/employee.model.js"
import { EmployeeAuthSchemaModel } from "../models/schema/authSchema.model.js";

class EmployeeController {
  checkValidation = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpException(400, "Validation failed", errors);
    }
  };

  employeeSignUp = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await EmployeeModel.employeeSignUp(req.body);

      const { statusCode } = response;
      res.status(statusCode).send(response);
    } catch (error) {
      // next(new HttpException(400, error.message));
      res.status(400).send({ status: false, error: error.message, data: null });
    }
  };

  employeeSignIn = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await EmployeeModel.employeeSignIn(req.body);

      const { statusCode } = response;
      res.status(statusCode).send(response);
    } catch (error) {
      // next(new HttpException(400, error.message));
      res.status(400).send({ status: false, error: error.message, data: null });
    }
  };

  fetchEmployeeProfile = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await EmployeeModel.fetchEmployeeProfile(req);

      const { statusCode } = response;

      res.status(statusCode).send(response);
    } catch (error) {
      // next(new HttpException(400, error.message));
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  updateEmployeeProfile = async (req, res, next) => {
      try {
        this.checkValidation(req);
        const response = await EmployeeModel.updateEmployeeProfile(req);
  
        const { statusCode } = response;
  
        res.status(statusCode).send(response);
      } catch (error) {
  
        res.status(400).send({ status: false, data: null, error: error.message });
      }
    }

  employeeForgotPassword = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await EmployeeModel.employeeForgotPassword(req.body);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  employeeResetPassword = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await EmployeeModel.employeeResetPassword(req.body);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  employeeLogout = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const employeeId = req.headers["employeeid"];

      const result = await EmployeeAuthSchemaModel.findOneAndUpdate(
        { employeeId }, // Filter
        { new: true } // Return the updated document
      );

      if (!result) {
        return res
          .status(404)
          .json({ status: false, data: null, error: "Employee doesn't exit" });
      }

      res
        .status(200)
        .send({ status: true, data: "Logout Successfully", error: null });
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  upsertEmployeeQuotation = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const { id } = req.body;

      let response;
      if (id) {
        response = await EmployeeModel.updateEmployeeQuotation(req);
      } else {
        response = await EmployeeModel.createEmployeeQuotation(req);
      }

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  fetchEmployeeQuotations = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await EmployeeModel.fetchEmployeeQuotations(req);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  deleteEmployeeQuotation = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await EmployeeModel.deleteEmployeeQuotation(req);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };
}

export default new EmployeeController();

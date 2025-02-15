import { validationResult } from "express-validator";

import HttpException from "../utils/HttpException.utils.js";
import AdminModel from "../models/admin.model.js";

import { AdminAuthSchemaModel } from "../models/schema/authSchema.model.js";

class EmployeeController {
  checkValidation = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpException(400, "Validation failed", errors);
    }
  };

  adminSignUp = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await AdminModel.adminSignUp(req.body);

      const { statusCode } = response;
      res.status(statusCode).send(response);
    } catch (error) {
      // next(new HttpException(400, error.message));
      res.status(400).send({ status: false, error: error.message, data: null });
    }
  };

  adminSignIn = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await AdminModel.adminSignIn(req.body);

      const { statusCode } = response;
      res.status(statusCode).send(response);
    } catch (error) {
      // next(new HttpException(400, error.message));
      res.status(400).send({ status: false, error: error.message, data: null });
    }
  };

  fetchAdminProfile = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await AdminModel.fetchAdminProfile(req);

      const { statusCode } = response;

      res.status(statusCode).send(response);
    } catch (error) {
      // next(new HttpException(400, error.message));
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  updateAdminProfile = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await AdminModel.updateAdminProfile(req);

      const { statusCode } = response;

      res.status(statusCode).send(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  adminForgotPassword = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await AdminModel.adminForgotPassword(req.body);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  adminResetPassword = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await AdminModel.adminResetPassword(req.body);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  adminLogout = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const adminId = req.headers["adminid"];

      const result = await AdminAuthSchemaModel.findOneAndUpdate(
        { adminId }, // Filter
        { new: true } // Return the updated document
      );

      if (!result) {
        return res
          .status(404)
          .json({ status: false, data: null, error: "Admin doesn't exit" });
      }

      res
        .status(200)
        .send({ status: true, data: "Logout Successfully", error: null });
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  upsertAdminQuotation = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const { id } = req.body;

      let response;
      if (id) {
        response = await AdminModel.updateAdminQuotation(req);
      } else {
        response = await AdminModel.createAdminQuotation(req);
      }

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  fetchAdminQuotations = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await AdminModel.fetchAdminQuotations(req);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  deleteAdminQuotation = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await AdminModel.deleteAdminQuotation(req);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  fetchAllUsers = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await AdminModel.fetchAllUsers(req);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  updateUserStatus = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await AdminModel.updateUserStatus(req);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  upsertTaxi = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const { id } = req.body;
      let response;
      if (id) {
        response = await AdminModel.updateTaxi(req);
      } else {
        response = await AdminModel.createTaxi(req);
      }

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  deleteTaxi = async (req, res, next) => {
    try {
      this.checkValidation(req);

      let response = await AdminModel.deleteTaxi(req);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  fatchTaxis = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await AdminModel.fatchTaxis(req);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  fetchTaxiData = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await AdminModel.fetchTaxiData(req);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  fetchNotifications = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await AdminModel.fetchNotifications(req);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  updateNotificationStatus = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await AdminModel.updateNotificationStatus(req.body);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  sendCustomNotification = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await AdminModel.sendCustomNotification(req.body);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  }
}

export default new EmployeeController();

import { validationResult } from "express-validator";
import crypto from "crypto";

import HttpException from "../utils/HttpException.utils.js";
import PartnerModel from "../models/partner.model.js";
import { PartnerAuthSchemaModel } from "../models/schema/authSchema.model.js";

class PartnerController {
  checkValidation = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpException(400, "Validation failed", errors);
    }
  };

  partnerSignUp = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await PartnerModel.partnerSignUp(req.body);

      const { statusCode } = response;
      res.status(statusCode).send(response);
    } catch (error) {
      // next(new HttpException(400, error.message));
      res.status(400).send({ status: false, error: error.message, data: null });
    }
  };

  partnerSignIn = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await PartnerModel.partnerSignIn(req.body);

      const { statusCode } = response;
      res.status(statusCode).send(response);
    } catch (error) {
      // next(new HttpException(400, error.message));
      res.status(400).send({ status: false, error: error.message, data: null });
    }
  };

  fetchPartnerProfile = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await PartnerModel.fetchPartnerProfile(req);

      const { statusCode } = response;

      res.status(statusCode).send(response);
    } catch (error) {
      // next(new HttpException(400, error.message));
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  partnerForgotPassword = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await PartnerModel.partnerForgotPassword(req.body);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  updatePartnerProfile = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await PartnerModel.updatePartnerProfile(req);

      const { statusCode } = response;

      res.status(statusCode).send(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  partnerResetPassword = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await PartnerModel.partnerResetPassword(req.body);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  partnerLogout = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const partnerId = req.headers["partnerid"];

      const result = await PartnerAuthSchemaModel.findOneAndUpdate(
        { partnerId }, // Filter
        { new: true } // Return the updated document
      );

      if (!result) {
        return res
          .status(404)
          .json({ status: false, data: null, error: "Partner doesn't exit" });
      }

      res
        .status(200)
        .send({ status: true, data: "Logout Successfully", error: null });
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  upsertPartnerQuotation = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const { id } = req.body;

      let response;
      if (id) {
        response = await PartnerModel.updatePartnerQuotation(req);
      } else {
        response = await PartnerModel.createPartnerQuotation(req);
      }

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  fetchPartnerQuotations = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await PartnerModel.fetchPartnerQuotations(req);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  deletePartnerQuotation = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await PartnerModel.deletePartnerQuotation(req);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };

  createTaxi = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await PartnerModel.createTaxi(req);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {}
  };

  fetchTaxis = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await PartnerModel.fetchPartnerTaxis(req);

      const { statusCode } = response;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(400).send({ status: false, data: null, error: error.message });
    }
  };
}

export default new PartnerController();

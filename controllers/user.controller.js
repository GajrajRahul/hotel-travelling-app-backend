import { validationResult } from "express-validator";
import HttpException from "../utils/HttpException.utils.js";
import userModel from "../models/user.model.js";

class UserController {
  checkValidation = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new HttpException(400, "Validation failed", errors);
    }
  };

  trackPdf = async (req, res, next) => {
    try {
      this.checkValidation(req);
      const response = await userModel.trackPdf(req.body);

      const { statusCode } = response;
      res.status(statusCode).send(response);
    } catch (error) {
      // next(new HttpException(400, error.message));
      res.status(400).send({ status: false, error: error.message, data: null });
    }
  };
}

export default new UserController();

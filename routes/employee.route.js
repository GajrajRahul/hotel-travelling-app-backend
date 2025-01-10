import express from "express";

import awaitHandlerFactory from "../middleware/awaitHandleFactory.middleware.js";
import EmployeeController from "../controllers/employee.controller.js";
import { employeeAuth } from "../middleware/employeeAuth.middleware.js";
import {
  validateDeleteQuotation,
  validateForgotPasswordRequest,
  validateLoginRequest,
  validateResetPasswordRequest,
  validateSignupRequest,
  validateUpsertQuotationRequest,
} from "../middleware/validator.middleware.js";

const employeeRoute = express.Router();

employeeRoute.post(
  "/signup",
  [validateSignupRequest],
  awaitHandlerFactory(EmployeeController.employeeSignUp)
);

employeeRoute.post(
  "/login",
  [validateLoginRequest],
  awaitHandlerFactory(EmployeeController.employeeSignIn)
);

employeeRoute.get(
  "/fetch-profile",
  [employeeAuth()],
  awaitHandlerFactory(EmployeeController.fetchEmployeeProfile)
);

employeeRoute.put(
  "/update-profile",
  [employeeAuth()],
  awaitHandlerFactory(EmployeeController.updateEmployeeProfile)
);

employeeRoute.post(
  "/forgot-password",
  [validateForgotPasswordRequest],
  awaitHandlerFactory(EmployeeController.employeeForgotPassword)
);

employeeRoute.post(
  "/reset-password",
  [validateResetPasswordRequest],
  awaitHandlerFactory(EmployeeController.employeeResetPassword)
);

employeeRoute.post(
  "/create-quotation",
  [employeeAuth(), validateUpsertQuotationRequest],
  awaitHandlerFactory(EmployeeController.upsertEmployeeQuotation)
);

employeeRoute.put(
  "/update-quotation",
  [validateUpsertQuotationRequest],
  awaitHandlerFactory(EmployeeController.upsertEmployeeQuotation)
);

employeeRoute.get(
  "/fetch-quotations",
  [employeeAuth()],
  awaitHandlerFactory(EmployeeController.fetchEmployeeQuotations)
);

employeeRoute.delete(
  "/delete-quotation",
  [employeeAuth(), validateDeleteQuotation],
  awaitHandlerFactory(EmployeeController.deleteEmployeeQuotation)
);

employeeRoute.post(
  "/create-taxi",
  [employeeAuth()],
  awaitHandlerFactory(EmployeeController.createTaxi)
);

employeeRoute.get(
  "/fetch-taxis",
  [employeeAuth()],
  awaitHandlerFactory(EmployeeController.fatchTaxis)
);

employeeRoute.get(
  "/logout",
  [employeeAuth()],
  awaitHandlerFactory(EmployeeController.employeeLogout)
);

export default employeeRoute;

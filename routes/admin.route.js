import express from "express";

import awaitHandlerFactory from "../middleware/awaitHandleFactory.middleware.js";
import AdminController from "../controllers/admin.controller.js";
import { adminAuth } from "../middleware/adminAuth.middleware.js";
import {
  validateDeleteQuotation,
  validateLoginRequest,
  validateSignupRequest,
  validateUpsertQuotationRequest,
} from "../middleware/validator.middleware.js";

const adminRoute = express.Router();

adminRoute.post(
  "/login",
  [validateLoginRequest],
  awaitHandlerFactory(AdminController.adminSignIn)
);

adminRoute.post(
  "/signup",
  [validateSignupRequest],
  awaitHandlerFactory(AdminController.adminSignUp)
);

adminRoute.get(
  "/fetch-profile",
  [adminAuth()],
  awaitHandlerFactory(AdminController.fetchAdminProfile)
);

adminRoute.post(
  "/create-quotation",
  [adminAuth(), validateUpsertQuotationRequest],
  awaitHandlerFactory(AdminController.upsertAdminQuotation)
);

adminRoute.put(
  "/update-quotation",
  [adminAuth(), validateUpsertQuotationRequest],
  awaitHandlerFactory(AdminController.upsertAdminQuotation)
);

adminRoute.get(
  "/fetch-quotations",
  [adminAuth()],
  awaitHandlerFactory(AdminController.fetchAdminQuotations)
);

adminRoute.delete(
  "/delete-quotation",
  [adminAuth(), validateDeleteQuotation],
  awaitHandlerFactory(AdminController.deleteAdminQuotation)
);

adminRoute.get(
  "/logout",
  [adminAuth()],
  awaitHandlerFactory(AdminController.adminLogout)
);

export default adminRoute;

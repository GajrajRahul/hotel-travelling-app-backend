import express from "express";

import awaitHandlerFactory from "../middleware/awaitHandleFactory.middleware.js";
import AdminController from "../controllers/admin.controller.js";
import { adminAuth } from "../middleware/adminAuth.middleware.js";
import {
  validateDeleteQuotation,
  validateForgotPasswordRequest,
  validateLoginRequest,
  validateResetPasswordRequest,
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

adminRoute.put(
  "/update-profile",
  [adminAuth()],
  awaitHandlerFactory(AdminController.updateAdminProfile)
);

adminRoute.post(
  "/forgot-password",
  [validateForgotPasswordRequest],
  awaitHandlerFactory(AdminController.adminForgotPassword)
);

adminRoute.post(
  "/reset-password",
  [validateResetPasswordRequest],
  awaitHandlerFactory(AdminController.adminResetPassword)
);

// adminRoute.get(
//   "/notifications",
//   [adminAuth()],
//   awaitHandlerFactory(AdminController.fetchAdminNotifications)
// );

// adminRoute.put(
//   "/approve-registration",
//   [adminAuth()],
//   awaitHandlerFactory(AdminController.approveRegistration)
// );

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
  "/fetch-users",
  [adminAuth()],
  awaitHandlerFactory(AdminController.fetchAllUsers)
);

adminRoute.put(
  "/update-status",
  [adminAuth()],
  awaitHandlerFactory(AdminController.updateUserStatus)
);

adminRoute.post(
  "/create-taxi",
  [adminAuth()],
  awaitHandlerFactory(AdminController.createTaxi)
);

adminRoute.get(
  "/fetch-taxis",
  // [adminAuth()],
  awaitHandlerFactory(AdminController.fatchTaxis)
);

adminRoute.get(
  "/logout",
  [adminAuth()],
  awaitHandlerFactory(AdminController.adminLogout)
);

export default adminRoute;

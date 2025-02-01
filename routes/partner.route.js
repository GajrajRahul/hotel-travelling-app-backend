import express from "express";

import awaitHandlerFactory from "../middleware/awaitHandleFactory.middleware.js";
import PartnerController from "../controllers/partner.controller.js";
import { partnerAuth } from "../middleware/partnerAuth.middleware.js";
import {
  validateDeleteQuotation,
  validateForgotPasswordRequest,
  validateLoginRequest,
  validateResetPasswordRequest,
  validateSignupRequest,
  validateUpsertQuotationRequest,
} from "../middleware/validator.middleware.js";

const partnerRouter = express.Router();

partnerRouter.post(
  "/signup",
  [validateSignupRequest],
  awaitHandlerFactory(PartnerController.partnerSignUp)
);

partnerRouter.post(
  "/login",
  [validateLoginRequest],
  awaitHandlerFactory(PartnerController.partnerSignIn)
);

partnerRouter.get(
  "/fetch-profile",
  [partnerAuth()],
  awaitHandlerFactory(PartnerController.fetchPartnerProfile)
);

partnerRouter.put(
  "/update-profile",
  [partnerAuth()],
  awaitHandlerFactory(PartnerController.updatePartnerProfile)
);

partnerRouter.post(
  "/forgot-password",
  [validateForgotPasswordRequest],
  awaitHandlerFactory(PartnerController.partnerForgotPassword)
);

partnerRouter.post(
  "/reset-password",
  [validateResetPasswordRequest],
  awaitHandlerFactory(PartnerController.partnerResetPassword)
);

partnerRouter.post(
  "/create-quotation",
  [partnerAuth(), validateUpsertQuotationRequest],
  awaitHandlerFactory(PartnerController.upsertPartnerQuotation)
);

partnerRouter.put(
  "/update-quotation",
  [validateUpsertQuotationRequest],
  awaitHandlerFactory(PartnerController.upsertPartnerQuotation)
);

partnerRouter.get(
  "/fetch-quotations",
  [partnerAuth()],
  awaitHandlerFactory(PartnerController.fetchPartnerQuotations)
);

partnerRouter.delete(
  "/delete-quotation",
  [partnerAuth(), validateDeleteQuotation],
  awaitHandlerFactory(PartnerController.deletePartnerQuotation)
);

partnerRouter.post(
  "/create-taxi",
  [partnerAuth()],
  awaitHandlerFactory(PartnerController.upsertTaxi)
);

partnerRouter.put(
  "/update-taxi",
  [],
  awaitHandlerFactory(PartnerController.upsertTaxi)
);

partnerRouter.delete(
  "/delete-taxi",
  [partnerAuth()],
  awaitHandlerFactory(PartnerController.deleteTaxi)
);

partnerRouter.get(
  "/fetch-taxis",
  [partnerAuth()],
  awaitHandlerFactory(PartnerController.fetchTaxis)
);

partnerRouter.post(
  "/fetch-taxi",
  [],
  awaitHandlerFactory(PartnerController.fetchTaxiData)
);

partnerRouter.get(
  "/fetch-notifications",
  [partnerAuth()],
  awaitHandlerFactory(PartnerController.fetchNotifications)
);

partnerRouter.put(
  "/update-notification-status",
  [partnerAuth()],
  awaitHandlerFactory(PartnerController.updateNotificationStatus)
);

partnerRouter.get(
  "/logout",
  [partnerAuth()],
  awaitHandlerFactory(PartnerController.partnerLogout)
);

export default partnerRouter;

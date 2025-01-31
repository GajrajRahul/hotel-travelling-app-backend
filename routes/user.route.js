import express from "express";

import awaitHandlerFactory from "../middleware/awaitHandleFactory.middleware.js";
import UserController from "../controllers/user.controller.js";

const userRoute = express.Router();

userRoute.post("/track-pdf", [], awaitHandlerFactory(UserController.trackPdf));

export default userRoute;
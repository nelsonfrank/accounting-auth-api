import express from "express";

const Router = express.Router();

import AuthController from "./auth.controller";

/**
 * POST /signup/tester
 * Tester registration route
 */

Router.post("/signup", AuthController.signUpController);

/**
 * POST /signin
 * Signin route
 */
Router.post("/signin", AuthController.signInController);

/**
 * POST /logout
 * Signout route
 */
Router.post("/logout", AuthController.logoutController);

/**
 * POST /forget-password
 * forget-password route
 */
Router.post("/forget-password", AuthController.forgetPassword);

/**
 * POST /reset-password
 * reset-password route
 */
Router.put("/reset-password/:authToken", AuthController.resetPassword);

/**
 * GET /send-verification-email
 * send-verification-email route
 */
Router.get("/send-verification-email", AuthController.sendVerificationEmail);

/**
 * POST /verify-email
 * verify-email route
 */
Router.post("/verify-email/:token", AuthController.emailVerification);

export default Router;

import express from "express";

const Router = express.Router();

import AuthController from "./auth.controller";

/**
 * POST /signup/tester
 * Tester registration route
 */

Router.post("/register", AuthController.signUpController);

/**
 * POST /signin
 * Signin route
 */
Router.post("/signin", AuthController.signInController);

/**
 * POST /verify-email
 * verify-email route
 */
Router.post("/verify-email", AuthController.emailVerification);

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


Router.post(
  "/verify-reset-password-token",
  AuthController.verifyForgetPasswordToken
);

/**
 * POST /reset-password
 * reset-password route
 */
Router.put("/reset-password", AuthController.resetPassword);

export default Router;

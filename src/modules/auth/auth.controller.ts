/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../user/user.model";
import {
  signInValidation,
  forgetPasswordValidation,
  tokenValidation,
  signUpValidation,
} from "../../validation/auth/index.types";
import { createTokens } from "../../utils/jwt.utils";
import { generateRandomToken, sendEmail } from "../../utils/Utils";
import { Response, Request } from "express";

const config = process.env;

const AuthController = {
  /**
   * @name signUpController
   * @description signup controller
   * @param req Request
   * @param res Response
   * @returns object
   */
  signUpController: async (req: Request, res: Response) => {
    const { error } = signUpValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const emailExist = await UserModel.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).send("User already exist");

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const token = generateRandomToken();

    const user = new UserModel({
      ...req.body,
      verificationToken: token,
      password: hashedPassword,
    });

    user
      .save()
      .then(async (response: any) => {
        console.log(response);
        const htmlContent = `Use token <b>${token}</b> to confirm your email`;
        await sendEmail(req.body.email, "Confirm Email", htmlContent);

        res.status(201).json({
          userId: user._id,
          ok: true,
          message: "user created successfully",
        });
      })
      .catch((error: any) => {
        res.status(500).json({
          ok: false,
          message: error?.message,
          error,
        });
      });

    return;
  },

  /**
   * @name signInController
   * @description signin controller
   * @param req Request
   * @param res Response
   * @returns object
   */
  signInController: async (req: Request, res: Response) => {
    // validate client payload
    const { error } = signInValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // check if user exists
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Email or Password is wrong!");

    if (!user.active) return res.status(400).send("Confirm your email");

    const { password, ...other } = user.toObject();
    return UserModel.find({ email: req.body.email })
      .then(async (doc) => {
        if (await bcrypt.compare(req.body.password, doc[0].password)) {
          const [authToken, refreshToken] = await createTokens(
            other,
            String(<string>config.TOKEN_SECRET),
            String(<string>config.REFRESH_TOKEN_SECRET)
          );
          res.status(200).json({
            ...other,
            status: "logged-in",
            token: {
              auth_token: authToken,
              refresh_token: refreshToken,
            },
          });
        } else {
          res.status(400).send("Fail to login in");
        }
      })
      .catch((error) => {
        res.status(500).json(error);
      });
  },

  /**
   * @name logoutController
   * @description logout controller
   * @param res Response
   * @returns object
   */
  logoutController: async (_req: Request, res: Response) => {
    try {
      res.status(200).json({ status: "logged-out successfully" });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  /**
   * @name forgetPassword
   * @description forget password controller
   * @param req Request
   * @param res Response
   * @returns object
   */
  forgetPassword: async (req: Request, res: Response) => {
    const { error } = forgetPasswordValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // check if user exists
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).send("User not exist");

    //
    const { password, ...others } = user.toObject();
    const [authToken] = await createTokens(
      others,
      String(<string>config.TOKEN_SECRET),
      String(<string>config.REFRESH_TOKEN_SECRET),
      "5m"
    );

    const url = `${config.FRONT_END_BASE_URL}/auth/reset-password?token=${authToken}`;
    const htmlContent = `Click <a href = '${url}'>here</a> to reset your password.`;

    await sendEmail(email, "Forget Password", htmlContent);

    return res.status(200).json({ ok: true, message: "Successed" });
  },

  /**
   * @name resetPassword
   * @description reset password controller
   * @param req Request
   * @param res Response
   * @returns object
   */
  resetPassword: async (req: Request, res: Response) => {
    const { authToken } = req.params;
    const { error } = tokenValidation({ authToken });
    if (error) return res.status(400).send(`Invalid token`);
    let payload;
    try {
      payload = jwt.verify(authToken, String(<string>config.TOKEN_SECRET));
    } catch (error: any) {
      if (Object.keys(error).includes("message"))
        return res.status(400).send(error.message);

      return res.status(400).send(error);
    }

    if (!payload || typeof payload === "string")
      return res.status(400).send("Fail to change password. Try again");

    const user = await UserModel.findById(payload._id);
    if (!user) return res.status(400).send("User not exist");

    const { password } = req.body;
    if (!password) return res.status(400).send(`New Password is required`);

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const userObj = user.toObject();
    return UserModel.findByIdAndUpdate(payload._id, {
      ...userObj,
      password: hashedPassword,
    }).then(() => {
      res.status(201).json({
        ok: true,
        message: "Password changed successfully",
      });
    });
  },

  /**
   * @name sendVerifyEmail
   * @description send verification email to user
   * @params req Request
   * @params res Response
   * @return void
   */

  sendVerificationEmail: async (req: Request, res: Response) => {
    const { email } = req.user;

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).send("User not exist");

    //
    const { password, ...others } = user.toObject();
    const [authToken] = await createTokens(
      others,
      String(<string>config.TOKEN_SECRET),
      String(<string>config.REFRESH_TOKEN_SECRET),
      "1d"
    );
    const url = `${config.FRONT_END_BASE_URL}/auth/verify-email?token=${authToken}`;
    const htmlContent = `Click <a href = '${url}'>here</a> to confirm your email.`;

    await sendEmail(email, "Confirm Email", htmlContent);
    return 0;
  },

  emailVerification: async (req: Request, res: Response) => {
    const { authToken } = req.params;
    const { error } = tokenValidation({ authToken });
    if (error) return res.status(400).send(`Invalid token`);

    let payload;
    try {
      payload = jwt.verify(authToken, String(<string>config.TOKEN_SECRET));
    } catch (error: any) {
      if (Object.keys(error).includes("message"))
        return res.status(400).send(error.message);

      return res.status(400).send(error);
    }

    if (!payload || typeof payload === "string")
      return res.status(400).send("Fail to verify email. Try again");

    const user = await UserModel.findById(payload._id);
    if (!user) return res.status(400).send("User not exist");

    const userObj = user.toObject();
    if (userObj.emailVerifiedAt)
      return res.status(400).send("This email already verified");

    const now = new Date();
    return UserModel.findByIdAndUpdate(payload._id, {
      ...userObj,
      emailVerifiedAt: now,
    }).then(() => {
      res.status(201).json({
        ok: true,
        message: "Email verified successfully",
      });
    });
  },
};

export default AuthController;

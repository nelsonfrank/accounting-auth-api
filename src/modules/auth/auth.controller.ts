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
import { generateRandomToken, isInThePast, sendEmail } from "../../utils/Utils";
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

    const { password, active, verifyBefore, ...other } = user.toObject();

    if (!active) return res.status(400).send("Confirm your email");

    const tokenExpired = isInThePast(new Date(verifyBefore));
    if (tokenExpired) return res.status(400).send("Token expired");

    return UserModel.find({ email: req.body.email })
      .then(async (doc) => {
        if (await bcrypt.compare(req.body.password, doc[0].password)) {
          const [authToken, refreshToken] = await createTokens(
            { ...other, verifyBefore, active },
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
  emailVerification: async (req: Request, res: Response) => {
    const { error } = tokenValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { token, email, ...others } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).send("Not found");

    const { verificationToken, _id, ...other } = user.toObject();
    if (verificationToken !== String(token))
      return res.status(400).send("Invalid token");

    const now = new Date();
    return UserModel.findByIdAndUpdate(_id, {
      ...others,
      active: true,
      emailVerifiedAt: now,
    }).then(() => {
      res.status(201).json({
        ok: true,
        message: "Email verified successfully",
      });
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
    const { password, _id, ...others } = user.toObject();

    const token = generateRandomToken();

    await UserModel.findByIdAndUpdate(_id, {
      ...others,
      verificationToken: token,
    }).then(() => {
      res.status(201).json({
        ok: true,
        message: "Token updated successfully",
      });
    });

    const htmlContent = `Use token <b>${token}</b> to confirm your email`;
    await sendEmail(req.body.email, "Reset password?", htmlContent);
  },

  verifyForgetPasswordToken: async (req: Request, res: Response) => {
    const { token, email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).send("User not exist");

    //
    const { password, verificationToken, ...others } = user.toObject();

    if (verificationToken !== String(token))
      return res.status(400).send("Invalid token");

    return res.status(200).json({ ok: true, message: "valid token" });
  },

  /**
   * @name resetPassword
   * @description reset password controller
   * @param req Request
   * @param res Response
   * @returns object
   */
  resetPassword: async (req: Request, res: Response) => {
    const { error } = tokenValidation(req.body);
    if (error) return res.status(400).send(`Invalid token`);

    const { password, email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).send("User not exist");

    if (!password) return res.status(400).send(`New Password is required`);

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const userObj = user.toObject();
    return UserModel.findByIdAndUpdate(userObj._id, {
      ...userObj,
      password: hashedPassword,
    }).then(() => {
      res.status(201).json({
        ok: true,
        message: "Password changed successfully",
      });
    });
  },
};

export default AuthController;

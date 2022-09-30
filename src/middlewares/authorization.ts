// dependencies
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// model
import UserModel from "../modules/user/user.model";

// utils
import { refreshTokens } from "../utils/jwt.utils";

// types
import { IUserType } from "../types/ability/ability.types";

const config = process.env;

const Authorization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(403).send("Access denied");
  }
  try {
    const payload = jwt.verify(token, config.TOKEN_SECRET as string);
    req.user = payload as IUserType;
  } catch (err) {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(403).send("Access, denied, Invalid refresh token");
    }

    const newTokens = await refreshTokens(
      refreshToken,
      UserModel,
      config.TOKEN_SECRET as string,
      config.REFRESH_TOKEN_SECRET as string
    );
    if (newTokens.token && newTokens.refreshToken) {
      const { token, refreshToken, user } = newTokens;
      res.cookie("auth_token", token, { sameSite: "lax", httpOnly: true });
      res.cookie("refresh_token", refreshToken, {
        sameSite: "lax",
        httpOnly: true,
      });
      req.user = user;
    } else {
      return res.status(401).send("Access denied, Invalid Token");
    }
  }
  return next();
};

export default Authorization;

// dependencies
import { Request, Response, NextFunction } from "express";

// ability
import defineAbilitiesFor from "../config/abilities";

// types

const Auth = async (req: Request, _res: Response, next: NextFunction) => {
  const ANONYMOUS_ABILITY = defineAbilitiesFor(null);

  req.ability = req.user ? defineAbilitiesFor(req.user) : ANONYMOUS_ABILITY;

  return next();
};

export default Auth;

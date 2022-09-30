// ability types
import { AppAbility, IUserType } from "./ability/ability.types";

export {};

declare global {
  namespace Express {
    interface Request {
      ability: AppAbility;
      user: IUserType;
    }
  }
}

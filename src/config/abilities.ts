import { defineAbility } from "@casl/ability";

// types
import { AppAbility, IUserType } from "../types/ability/ability.types";

// Constants
const ROLES = {
  ADMIN: "admin",
  TESTER: "tester",
  MODERATOR: "moderator",
};

export const MODEL_NAMES = { NOTE: "Note", USER: "User" };

export default function defineAbilitiesFor(user: IUserType | null) {
  return defineAbility<AppAbility>((can) => {
    can("create", "User");

    if (user) {
      if (user.role === ROLES.ADMIN) {
        can("manage", "all");
      }

      if (user.role === ROLES.MODERATOR) {
        can("create", "Project");
        can("update", "Project", { ownerId: user._id });
        can("delete", "Project", { ownerId: user._id });
        can("read", "User", { _id: user._id });
        can("update", "User", { _id: user._id });
      }
    }
  });
}

//dependencies
import { Ability, MongoQuery } from "@casl/ability";

// types
import { UserModelType } from "../user/user.model.type";

export interface IUserType extends UserModelType {
  _id: string;
}

export interface Project {
  ownerId: string;
}

export interface User {
  _id: string;
}

export type Actions = "manage" | "create" | "read" | "update" | "delete";

export type Subjects = Project | User | "Project" | "User" | "all";

export type Conditions = MongoQuery;

export type AppAbility = Ability<[Actions, Subjects], Conditions>;

/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import validator from "validator";

const Schema = mongoose.Schema;

import { UserModelType } from "../../types/user/user.model.type";

// user schema definition
const UserSchema = new Schema<UserModelType>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: (value: string) => validator.isEmail(value),
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["tester", "moderator", "admin"],
    },
    active: { type: Boolean, default: false },
    verificationToken: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    emailVerifiedAt: { type: Date, required: false },
  },
  {
    versionKey: false,
  }
);

// Sets the createdAt parameter equal to the current time
UserSchema.pre("save", function (next) {
  const now = new Date();
  if (!this.createdAt) {
    this.createdAt = now;
  }
  next();
});

export { UserSchema };
//Exports the UserSchema for use elsewhere.
export default mongoose.model("User", UserSchema);

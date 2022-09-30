import Joi from "joi";
import { UserModelType } from "../../types/user/user.model.type";

export const signUpValidation = (data: UserModelType) => {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().required(),
  });

  return schema.validate(data);
};

interface signInPayloadType {
  email: string;
  password: string;
}
export const signInValidation = (data: signInPayloadType) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(data);
};

interface forgetPasswordPayloadType {
  email: string;
}
export const forgetPasswordValidation = (data: forgetPasswordPayloadType) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });

  return schema.validate(data);
};

interface tokenValidationParamsType {
  authToken: string;
  password: string;
}
export const tokenValidation = (data: tokenValidationParamsType) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(data);
};

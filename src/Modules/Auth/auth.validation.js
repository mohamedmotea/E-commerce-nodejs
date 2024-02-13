import Joi from "joi";
import { rule } from "../../utils/systemRule.js";
import validation from "../../utils/validation.js";

export const signup = {
  body:Joi.object({
    username: Joi.string().required().min(3).max(20),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
    role: Joi.string().valid(rule.USER, rule.ADMIN,rule.SUPERADMIN),
    addresses: Joi.array().required(),
    phoneNumbers: Joi.array().required(),
    age: Joi.number().min(12).max(100)
  })
}

export const verifiy = {
  query:Joi.object({
    email:Joi.string().required()
  })
}

export const signIn = {
  body:Joi.object({
    email:Joi.string().required().email(),
    password:Joi.string().required().min(6)
  })
}
export const updateUser = {
  body:Joi.object({
    username:Joi.string().min(3).max(20),
    age:Joi.number().min(12).max(100),
    phoneNumbers:Joi.array(),
    addresses:Joi.array(),
    oldPassword:Joi.string().min(6),
    newPassword:Joi.string().min(6),
    email:Joi.string().email()
  }),
  headers:validation.headers

}
export const deleteUser = {
  headers:validation.headers
}
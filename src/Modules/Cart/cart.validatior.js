import Joi from "joi";
import validation from './../../utils/validation.js';


export const addProductToCart = {
  body:Joi.object({
    quantity:Joi.number().required(),
    productId:Joi.custom(validation.params).required()
  }),
  headers:validation.headers
}

export const removeProductFromCart = {
  params:Joi.object({
    productId:Joi.custom(validation.params).required()
  }),
  headers:validation.headers
}
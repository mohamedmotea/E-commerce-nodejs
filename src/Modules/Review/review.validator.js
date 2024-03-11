import Joi from "joi";
import validation from './../../utils/validation.js';


export const addReview = {
  body:Joi.object({
    rate:Joi.number().required().valid(1,2,3,4,5),
    comment:Joi.string()
  }),
  headers:validation.headers,
  params:Joi.object({
    productId:Joi.custom(validation.params).required()
  })
}

export const deleteReview = {
  headers:validation.headers,
  params:Joi.object({
    reviewId:Joi.custom(validation.params).required()
  })
}
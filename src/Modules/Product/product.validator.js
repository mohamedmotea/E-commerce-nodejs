import Joi from "joi";
import validation from './../../utils/validation.js';

export const addProduct={
  body:Joi.object({
    title:Joi.string().required().min(1).max(255),
    desc:Joi.string(),
    basePrice:Joi.number().required(),
    discount:Joi.number(),
    stock:Joi.number().required(),
    specs:Joi.string().required()
  }),
  headers:validation.headers,
  query:Joi.object({
    categoryId:Joi.custom(validation.params).required(),
    subCategoryId:Joi.custom(validation.params).required(),
    brandId:Joi.custom(validation.params).required()
  }),

}

export const updateProduct= {
  headers:validation.headers,
  body:Joi.object({
    title:Joi.string(),
    desc:Joi.string(),
    basePrice:Joi.number(),
    discount:Joi.number(),
    stock:Joi.number(),
    specs:Joi.string(),
    oldPublic_id:Joi.string()
  }),
  params:Joi.object({
    productId:Joi.custom(validation.params).required()
  }),
  file:validation.file
}

export const productParams = {
  params:Joi.object({
    productId:Joi.custom(validation.params).required()
  })
}

import Joi from 'joi';
import validation from './../../utils/validation.js';

export const addBrand = {
  headers:validation.headers,
  body:Joi.object({
    name:Joi.string().min(1).max(255).required(),
  }),
  query:Joi.object({
    subCategoryId:Joi.custom(validation.params).required(),
    categoryId:Joi.custom(validation.params).required()
  })
}

export const updateBrand = {
  headers:validation.headers,
  body:Joi.object({
    name:Joi.string(),
    oldPublic_id:Joi.string(),
    subCategoryId:Joi.custom(validation.params).required(),
    categoryId:Joi.custom(validation.params).required()
  }),
  params:Joi.object({
    brandId:Joi.custom(validation.params).required()
  })
}

export const brandParams = {
  params:Joi.object({
    brandId:Joi.custom(validation.params).required()
  })
}
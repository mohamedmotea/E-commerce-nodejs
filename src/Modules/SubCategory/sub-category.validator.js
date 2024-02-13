import Joi from "joi";
import validation from './../../utils/validation.js';

export const addSubCategory = {
  body:Joi.object({
    name:Joi.string().required(),
  }),
  headers:validation.headers,
  params:Joi.object({
    categoryId:Joi.custom(validation.params).required()
  })
}

export const updateSubCategory = {
  body:Joi.object({
    name:Joi.string(),
    oldPublic_id:Joi.string()
  }),
  headers:validation.headers,
  params:Joi.object({
    categoryId:Joi.custom(validation.params).required(),
    subCategoryId:Joi.custom(validation.params).required()
  })
}
export const idParams = {
  params:Joi.object({
    subCategoryId:Joi.custom(validation.params).required()
  })
}
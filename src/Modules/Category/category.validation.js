
import Joi from 'joi';
import validation from './../../utils/validation.js';

export const addCategory = {
  body:Joi.object(
    {
      name: Joi.string().min(1).max(255).required(),
    }
  ) ,
  headers:validation.headers
}

export const updateCategory = {
  body:Joi.object({
    name: Joi.string().min(1).max(255),
    oldPublic_id: Joi.string()
  }),
  headers:validation.headers,
  params:Joi.object({
    categoryId: Joi.custom(validation.params).required()
  })
}

export const getSingleCategory = {
  params:Joi.object({
    categoryId: Joi.custom(validation.params).required()
  })
}

export const deleteCategory = {
  headers:validation.headers,
  params:Joi.object({
    categoryId: Joi.custom(validation.params).required()
  })
}
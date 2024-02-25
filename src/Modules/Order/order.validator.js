import Joi from "joi";
import * as sysyemRule from '../../utils/systemRule.js'
import validation from './../../utils/validation.js';

export const createOrder = {
  body:Joi.object({
    couponCode:Joi.string(),
    productId:Joi.string().custom(validation.params).required(),
    quantity:Joi.number().required(),
    phone:Joi.string().required(),
    address:Joi.string().required(),
    city:Joi.string().required(),
    state:Joi.string().required(),
    country:Joi.string().required(),
    zipCode:Joi.string().required(),
    paymentMethod:Joi.string().required().valid(...Object.values(sysyemRule.paymentMethod))
  }),
  headers:validation.headers
}

export const orderByCart = {
  headers:validation.headers,
  body:Joi.object({
    couponCode:Joi.string(),
    phone:Joi.string().required(),
    address:Joi.string().required(),
    city:Joi.string().required(),
    state:Joi.string().required(),
    country:Joi.string().required(),
    zipCode:Joi.string().required(),
    paymentMethod:Joi.string().required().valid(...Object.values(sysyemRule.paymentMethod))
  })
}

export const deliverOrder = {
  headers:validation.headers,
  params:Joi.object({
    orderId:Joi.custom(validation.params).required()
  })
}

export const getOrders = {
  headers:validation.headers,
  query:Joi.object({
    delivered:Joi.boolean()
    ,paid:Joi.boolean()
    ,placed:Joi.boolean()

  })
}

export const cancelledOrder = {
  headers:validation.headers,
  params:Joi.object({
    orderId:Joi.custom(validation.params).required()
  })
}
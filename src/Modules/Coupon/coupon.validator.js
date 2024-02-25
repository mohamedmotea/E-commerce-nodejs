import Joi from "joi";
import validation from './../../utils/validation.js';


export const addCoupon = {
  body:Joi.object({
    couponCode:Joi.string().alphanum().required()
    , couponAmount:Joi.number().min(1).required()
    , isFixed:Joi.boolean()
    ,isPercentage:Joi.boolean()
    ,fromDate:Joi.date().greater(Date.now() - (24 * 60 * 60 * 1000)).required()
    ,toDate:Joi.date().greater(Joi.ref('fromDate')).required(),
    users:Joi.array().items(Joi.object({
      userId:Joi.custom(validation.params).required(),
      maxUsage:Joi.number().min(1).required()
    }))
  }),
  headers:validation.headers
}

export const updateCoupon = {
  body:Joi.object({
    couponCode:Joi.string().alphanum()
  , couponAmount:Joi.number().min(1)
  , isFixed:Joi.boolean()
  ,isPercentage:Joi.boolean()
  ,fromDate:Joi.date().greater(Date.now() - (24 * 60 * 60 * 1000))
  ,toDate:Joi.date().greater(Joi.ref('fromDate')),
    newUsers:Joi.array().items(Joi.object({
      userId:Joi.custom(validation.params),
      maxUsage:Joi.number().min(1)
    })),
    oldUserIds:Joi.array().items(Joi.custom(validation.params))
  }),
  params:Joi.object({
    couponId:Joi.custom(validation.params).required()
  }),
  headers:validation.headers,
}

export const deleteCoupon = {
  params:Joi.object({
    couponId:Joi.custom(validation.params).required()
  }),
  headers:validation.headers
}

export const getSingleCoupon = {
  params:Joi.object({
    couponId:Joi.custom(validation.params).required()
  })
}

export const appliedCoupons = {
  headers:validation.headers,
  body:Joi.object({
    code:Joi.string().required()
  })
}
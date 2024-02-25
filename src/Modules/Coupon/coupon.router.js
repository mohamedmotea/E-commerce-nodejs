import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import vld from "../../Middlewares/validation.middleware.js";
import { rule } from "../../utils/systemRule.js";
import auth from './../../Middlewares/auth.middleware.js';
import * as CC from './coupon.controller.js'
import * as validationSchema from './coupon.validator.js'

const router = Router()

router
.post('/',vld(validationSchema.addCoupon),auth([rule.ADMIN,rule.SUPERADMIN]),expressAsyncHandler(CC.addCoupon))
.put('/:couponId',vld(validationSchema.updateCoupon),auth([rule.ADMIN,rule.SUPERADMIN]),expressAsyncHandler(CC.updateCoupon))
.delete('/:couponId',vld(validationSchema.deleteCoupon),auth([rule.ADMIN,rule.SUPERADMIN]),expressAsyncHandler(CC.deleteCoupon))
.get('/:couponId',vld(validationSchema.getSingleCoupon),expressAsyncHandler(CC.getSingleCoupon))
.get('/',expressAsyncHandler(CC.getAllCoupons))
.post('/appliedCoupon',vld(validationSchema.appliedCoupons),auth([rule.ADMIN,rule.SUPERADMIN]),expressAsyncHandler(CC.validateCoupon))

export default router
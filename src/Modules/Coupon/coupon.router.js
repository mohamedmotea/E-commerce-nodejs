import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import vld from "../../Middlewares/validation.middleware.js";
import { rule } from "../../utils/systemRule.js";
import * as CC from './coupon.controller.js'
import * as validationSchema from './coupon.validator.js'
import auth from './../../Middlewares/auth.middleware.js';

const router = Router()

router
.post('/',vld(validationSchema.addCoupon),auth([rule.ADMIN,rule.SUPERADMIN]),expressAsyncHandler(CC.addCoupon))
.put('/:couponId',vld(validationSchema.updateCoupon),auth([rule.ADMIN,rule.SUPERADMIN]),expressAsyncHandler(CC.updateCoupon))
.delete('/:couponId',vld(validationSchema.deleteCoupon),auth([rule.ADMIN,rule.SUPERADMIN]),expressAsyncHandler(CC.deleteCoupon))
.get('/:couponId',vld(validationSchema.getSingleCoupon),expressAsyncHandler(CC.getSingleCoupon))
.get('/',expressAsyncHandler(CC.getAllCoupons))

export default router
import { Router } from "express"
import expressAsyncHandler from "express-async-handler"
import { rule } from './../../utils/systemRule.js';
import vld from './../../Middlewares/validation.middleware.js';
import auth from './../../Middlewares/auth.middleware.js';
import * as OC from './order.controller.js'
import * as validationSchema from './order.validator.js'
const router = Router()

router
.post('/',vld(validationSchema.createOrder),auth([rule.SUPERADMIN,rule.USER]),expressAsyncHandler(OC.createOrder))
.post('/cart',vld(validationSchema.orderByCart),auth([rule.SUPERADMIN,rule.USER]),expressAsyncHandler(OC.orderByCart))
.put('/:orderId',vld(validationSchema.deliverOrder),auth([rule.DELIVER]),expressAsyncHandler(OC.deliverOrder))
.patch('/:orderId',vld(validationSchema.cancelledOrder),auth([rule.SUPERADMIN,rule.USER]),expressAsyncHandler(OC.cancelledOrder))
.get('/:orderId',vld(validationSchema.cancelledOrder),auth([rule.SUPERADMIN]),expressAsyncHandler(OC.getOrderData))
.get('/',vld(validationSchema.getOrders),auth([rule.SUPERADMIN,rule.USER]),expressAsyncHandler(OC.getOrders))
// payment -> stripe
.post('/checkout/:orderId',auth([rule.USER]),expressAsyncHandler(OC.payWithStripe))
// .post('/webhook/',expressAsyncHandler(OC.webhookLocal))
export default router
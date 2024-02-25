import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import auth from './../../Middlewares/auth.middleware.js';
import * as CC from './cart.controller.js'
import * as validationSchema from './cart.validatior.js'
import { rule } from "../../utils/systemRule.js";
import vld from './../../Middlewares/validation.middleware.js';
const router = Router();

router.post('/', auth([rule.USER]), vld(validationSchema.addProductToCart), expressAsyncHandler(CC.addProductToCart))
.put('/:productId',vld(validationSchema.removeProductFromCart),auth([rule.USER]),expressAsyncHandler(CC.removeProductFromCart))
export default router
import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import auth from './../../Middlewares/auth.middleware.js';
import vld from './../../Middlewares/validation.middleware.js';
import multerMiddleware from './../../Middlewares/multer.middleware.js';
import { rule } from "../../utils/systemRule.js";
import * as validationSchema from './product.validator.js'
import * as PC from './product.controller.js'
const router = Router()

router
.post('/',multerMiddleware().array('images',6),vld(validationSchema.addProduct),auth([rule.SUPERADMIN,rule.ADMIN]),expressAsyncHandler(PC.addProduct))
.put('/:productId',multerMiddleware().single('image'),vld(validationSchema.updateProduct),auth([rule.SUPERADMIN,rule.ADMIN]),expressAsyncHandler(PC.updateProduct))
.get('/:productId',vld(validationSchema.productParams),expressAsyncHandler(PC.getSingleProduct))
.get('/',expressAsyncHandler(PC.getAllProducts))
.delete('/:productId',vld(validationSchema.productParams),auth([rule.ADMIN,rule.SUPERADMIN]),expressAsyncHandler(PC.deleteProduct))

export default router
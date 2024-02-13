import { Router } from "express";
import multerMiddleware from "../../Middlewares/multer.middleware.js";
import auth from "../../Middlewares/auth.middleware.js";
import { rule } from "../../utils/systemRule.js";
import expressAsyncHandler from "express-async-handler";
import * as BC from './brand.controller.js'
import * as validationSchema from './brand.validator.js'
import vld from './../../Middlewares/validation.middleware.js';
const router = Router()


router.post('/',multerMiddleware().single('logo'),vld(validationSchema.addBrand),auth([rule.SUPERADMIN,rule.ADMIN]),expressAsyncHandler(BC.addBrand))
.patch('/:brandId',multerMiddleware().single('logo'),auth([rule.SUPERADMIN,rule.ADMIN]),vld(validationSchema.updateBrand),expressAsyncHandler(BC.updateBrand))
.get('/:brandId',vld(validationSchema.brandParams),expressAsyncHandler(BC.getSingleBrand))
.get('/',expressAsyncHandler(BC.getAllBrands))
.delete('/:brandId',auth([rule.SUPERADMIN,rule.ADMIN]),vld(validationSchema.brandParams),expressAsyncHandler(BC.deleteBrand))
export default router
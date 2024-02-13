import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import auth from './../../Middlewares/auth.middleware.js';
import { rule } from "../../utils/systemRule.js";
import * as SC from './sub-category.controller.js'
import * as schema from './sub-category.validator.js'
import multerMiddleware from './../../Middlewares/multer.middleware.js';
import vld from './../../Middlewares/validation.middleware.js';



const router = Router()

router
.post('/:categoryId',multerMiddleware().single('image'),auth([rule.SUPERADMIN]),vld(schema.addSubCategory),expressAsyncHandler(SC.addSubCategory)) 
.put('/:subCategoryId',multerMiddleware().single('image'),auth([rule.SUPERADMIN]),expressAsyncHandler(SC.updateSubCategory))
.get('/:subCategoryId',vld(schema.idParams),expressAsyncHandler(SC.getSingleSubCategory))
.get('/',expressAsyncHandler(SC.getAllSubCategories))
.delete('/:subCategoryId',auth([rule.SUPERADMIN]),vld(schema.idParams),expressAsyncHandler(SC.deleteSubCategory))
export default router
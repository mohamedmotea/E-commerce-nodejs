import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import * as CC from './category.controller.js'
import * as schema from './category.validation.js'
import auth from './../../Middlewares/auth.middleware.js';
import { rule } from "../../utils/systemRule.js";
import vld from './../../Middlewares/validation.middleware.js';
import multerMiddleware from './../../Middlewares/multer.middleware.js';


const router = Router()

router.post('/',multerMiddleware().single('image'), auth([rule.SUPERADMIN]),vld(schema.addCategory),expressAsyncHandler(CC.addCategory))
.put('/:categoryId',multerMiddleware().single('image'),auth([rule.SUPERADMIN,rule.ADMIN]),vld(schema.updateCategory),expressAsyncHandler(CC.updateCategory))
.get('/',expressAsyncHandler(CC.getAllCategories))
.get('/:categoryId',vld(schema.getSingleCategory),expressAsyncHandler(CC.getSingleCategory))
.delete('/:categoryId',auth([rule.SUPERADMIN]),vld(schema.deleteCategory),expressAsyncHandler(CC.deleteCategory))
export default router

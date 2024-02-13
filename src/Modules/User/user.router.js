import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import * as UC from './user.controller.js'
import * as schema from './user.validator.js'
import auth from './../../Middlewares/auth.middleware.js';
import vld from './../../Middlewares/validation.middleware.js';
import { rule } from "../../utils/systemRule.js";

const router = Router()

router.get('/',auth([rule.USER,rule.ADMIN]),vld(schema.getUserData),expressAsyncHandler(UC.getUserData))

export default router
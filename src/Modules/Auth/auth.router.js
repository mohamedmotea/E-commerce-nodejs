import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import * as AC from './auth.controller.js';
import * as schema from './auth.validation.js'
import vld from './../../Middlewares/validation.middleware.js';
import auth from './../../Middlewares/auth.middleware.js';
import { rule } from "../../utils/systemRule.js";

const router = Router()

router
.post('/signup', vld(schema.signup),expressAsyncHandler(AC.signUp))
.get('/verify/',vld(schema.verifiy),expressAsyncHandler(AC.verifyEmail))
.post('/signin',vld(schema.signIn),expressAsyncHandler(AC.signIn))
.put('/',auth([rule.USER,rule.ADMIN,rule.SUPERADMIN]),vld(schema.updateUser),expressAsyncHandler(AC.updateUser))
.delete('/',auth([rule.USER,rule.ADMIN,rule.SUPERADMIN]),vld(schema.deleteUser),expressAsyncHandler(AC.deleteUser))

export default router
import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import auth from '../../Middlewares/auth.middleware.js';
import vld from '../../Middlewares/validation.middleware.js';
import { rule } from "../../utils/systemRule.js";
import * as validationSchema from './review.validator.js'
import * as RC from './review.controller.js'

const router = Router();

router.post('/:productId',vld(validationSchema.addReview),auth(Object.values(rule)),expressAsyncHandler(RC.addReview))
router.delete('/:reviewId',vld(validationSchema.deleteReview),auth(Object.values(rule)),expressAsyncHandler(RC.deleteReview))

export default router
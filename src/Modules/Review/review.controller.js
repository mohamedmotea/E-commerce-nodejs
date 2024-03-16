import Order from "../../../DB/Models/order.model.js"
import Product from "../../../DB/Models/product.model.js"
import Review from "../../../DB/Models/review.model.js"
import * as systemRules from '../../utils/systemRule.js'
import { calcRate } from './../../utils/calc-rate.js';
import { isReviewExist } from './utils/check-review-exist.js';

export const addReview = async (req, res, next) => {
  // destructuring the required data from request body
  const {rate,comment} = req.body
  // destructuring the required data from request params
  const {productId} = req.params
  // destructuring the required data from request authentcation
  const {id :userId} = req.user
  // check Product
  const product = await Product.findById(productId)
  if(!product) return next(new Error('product not found',{cause:404}))
  // get order 
  const order = await Order.find({'orderItemes.productId':productId,userId,orderStatus:systemRules.orderstatus.DELIVERED})
  if(!order) return next(new Error('You Should buy This Product first',{cause:403}))
  // ############# check if this user has already reviewed this product
  const checkReview = await isReviewExist({userId,productId,rate})
  if(checkReview?.message){
  return res.status(200).json({
      message:checkReview.message,
      data:checkReview.review,
      product:checkReview.product
    })
  } 

  // create new 
  const review = await Review.create({rate,comment,userId,productId})
  req.savedDocument = {model:Review,_id:review._id}
  if(!review) return next(new Error('review not added',{cause:404}))
  const calcProductRate = await calcRate({productId})
  res.status(200).json({
    message:'review added successfully',
    data:review,
    product:calcProductRate
  })
}

export const deleteReview = async (req, res, next) => {
  const {reviewId} = req.params
  // destructuring the required data from request authentcation
  const {id :userId,role} = req.user
  const review = await Review.findById(reviewId)
  if(!review) return next(new Error('review not found',{cause:404}))
  if(role != systemRules.rule.SUPERADMIN && userId != review.userId) return next(new Error('unauthorized',{cause:403}))
  await Review.findByIdAndDelete(reviewId)
  const calcProductRate = await calcRate({productId:review.productId})
  return res.status(201).json({
    message:'review deleted successfully',
    data:review,
    product:calcProductRate
  })
}

import Review from "../../../../DB/Models/review.model.js"
import { calcRate } from "../../../utils/calc-rate.js"


export const isReviewExist = async({userId,productId,rate})=>{
  const checkReview = await Review.findOne({userId,productId})
  if(checkReview){
    checkReview.rate = rate
    checkReview.save()
    const calcProductRate = await calcRate({productId})
    return {message:'review updated successfully',product:calcProductRate,review:checkReview}
  }
}
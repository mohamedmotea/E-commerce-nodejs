import Product from "../../DB/Models/product.model.js"
import Review from "../../DB/Models/review.model.js"


export const calcRate = async({productId})=>{
  let rateArr = []
  const reviews = await Review.find({productId})
  const product = await Product.findById(productId)
  for (const rate of reviews) {rateArr.push(rate.rate)}
  const reduceRate = (rateArr.reduce((accumulator,currentValue)=> accumulator + currentValue,0 ) / reviews.length) || 0
  product.avgRating = reduceRate.toFixed(1)
  await product.save()
  return product
}
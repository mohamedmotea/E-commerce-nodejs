import { Schema, model } from "mongoose";

const review_schema = new Schema({
  userId:{
    type: Schema.Types.ObjectId,
    ref: "User",
    required:true
  },
  productId:{
    type: Schema.Types.ObjectId,
    ref: "Product",
    required:true
  },
  rate:{
    type:Number,
    required:true,
    min:1,
    max:5,
    enum:[1,2,3,4,5]
  },
  comment:String,
  
},{timeseries:true})

const Review = model('Review', review_schema)

export default Review
import { Schema, model } from "mongoose";

const couponUsers_schema = new Schema({
  couponId:{
    type: Schema.Types.ObjectId,
    ref: "Coupon",
    required:true
  },
  userId:{
    type: Schema.Types.ObjectId,
    ref: "User",
    required:true
  },
  maxUsage:{
    type: Number,
    required:true,
    min:1
  },
  usage:{
    type: Number,
    min:0,
    default:0
  }
},{timestamps:true})

const CouponUsers = model('CouponUsers', couponUsers_schema)

export default CouponUsers
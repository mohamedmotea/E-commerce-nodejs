import { Schema, model } from "mongoose";

const coupon_schema = new Schema({
  couponCode:{
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  couponAmount:{
    type: Number,
    required: true,
    min:1
  },
  couponStatus:{
    type:String,
    enum:['valid','expired'],
    default:'valid'
  },
  isFixed:{
    type:Boolean,
    default:false
  },
  isPercentage:{
    type:Boolean,
    default:false
  },
  addedBy:{
    type: Schema.Types.ObjectId,
    ref: "User",
    required:true
  },
  updatedBy:{
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  fromDate:{
    type:String,
    required:true
  },
  toDate:{
    type:String,
    required:true
  }
},{timestamps:true,
toJSON:{virtuals:true},
toObject:{virtuals:true}})

coupon_schema.virtual('users',{
  ref:'CouponUsers',
  localField:'_id',
  foreignField:'couponId'
})


const Coupon = model('Coupon', coupon_schema)

export default Coupon
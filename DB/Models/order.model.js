import { Schema, model } from "mongoose";
import { orderstatus, paymentMethod } from "../../src/utils/systemRule.js";

const order_schema = new Schema({
  // object Ids
  userId:{type: Schema.Types.ObjectId,ref: "User",required:true},
  couponId:{type:Schema.Types.ObjectId,ref:'Coupon'},
  cancelledBy:{type:Schema.Types.ObjectId,ref:'User'},

  // Arrays
  orderItemes:[{
    productId:{type: Schema.Types.ObjectId, required:true,ref:'Product'},
    title:{type:String, required:true},
    quantity:{type:Number, required:true,default:1},
    basePrice:{type:Number, required:true,default:0},
    finalPrice:{type:Number, required:true,default:0},
    totalPrice:{type:Number, required:true,default:0},
    discount:{type:Number,default:0}
  }],
  phoneNumbers:{
    type:Array,
    required:true
  },
  shippingAddress:{
    address:{type:String, required:true},
    city:{type:String, required:true},
    state:{type:String, required:true},
    country:{type:String, required:true},
    zipCode:{type:String, required:true},
  },

  // Strings
  shippingPrice:{type:Number,required:true},
  paymentMethod:{type:String,enum:Object.values(paymentMethod),required:true},
  orderStatus:{type:String,enum:Object.values(orderstatus),required:true,default:orderstatus.PENDING},
  paidAt:{type:String},
  deliveredAt:{type:String},
  cancelledAt:{type:String},
  // Numbers
  totalPrice:{type:Number,required:true},
  // Booleans
  isPaid:{type:Boolean,default:false},
  isDelivered:{type:Boolean,default:false},
  

  payment_method :{
    type:String
  }
},{
  timestamps: true
})

const Order = model('Order', order_schema)

export default Order